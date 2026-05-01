import json
import pytest

@pytest.fixture
def auth_data(client):
    client.post('/api/auth/register', json={
        'username': 'dashuser',
        'email': 'dashuser@example.com',
        'password': 'password123',
        'full_name': 'Dash User'
    })
    res = client.post('/api/auth/login', json={
        'email': 'dashuser@example.com',
        'password': 'password123'
    })
    token = json.loads(res.data)['access_token']
    user_id = json.loads(res.data)['user']['id']
    
    # Create team
    res_team = client.post('/api/teams', json={'name': 'Dash Team'}, headers={'Authorization': f'Bearer {token}'})
    team_id = json.loads(res_team.data)['team']['id']
    
    return {'token': token, 'team_id': team_id, 'user_id': user_id}

def test_dashboard_stats(client, auth_data):
    token = auth_data['token']
    team_id = auth_data['team_id']
    user_id = auth_data['user_id']
    
    # Initial stats
    res1 = client.get(f'/api/dashboard/stats?team_id={team_id}', headers={'Authorization': f'Bearer {token}'})
    data1 = json.loads(res1.data)
    assert response_code(res1) == 200
    assert data1['stats']['total'] == 0
    assert data1['stats']['progress'] == 0
    assert data1['stats']['member_count'] == 1
    
    # Create tasks
    client.post('/api/tasks', json={'team_id': team_id, 'title': 'T1', 'status': 'completed', 'assigned_to': user_id}, headers={'Authorization': f'Bearer {token}'})
    client.post('/api/tasks', json={'team_id': team_id, 'title': 'T2', 'status': 'todo'}, headers={'Authorization': f'Bearer {token}'})
    
    # Fetch stats again
    res2 = client.get(f'/api/dashboard/stats?team_id={team_id}', headers={'Authorization': f'Bearer {token}'})
    data2 = json.loads(res2.data)
    
    assert data2['stats']['total'] == 2
    assert data2['stats']['completed'] == 1
    assert data2['stats']['todo'] == 1
    assert data2['stats']['progress'] == 50
    assert data2['stats']['my_tasks']['total'] == 1
    assert data2['stats']['my_tasks']['completed'] == 1

def response_code(res):
    return res.status_code
