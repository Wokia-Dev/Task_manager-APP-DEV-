import json
import pytest

@pytest.fixture
def auth_data(client):
    client.post('/api/auth/register', json={
        'username': 'taskuser',
        'email': 'taskuser@example.com',
        'password': 'password123',
        'full_name': 'Task User'
    })
    res = client.post('/api/auth/login', json={
        'email': 'taskuser@example.com',
        'password': 'password123'
    })
    token = json.loads(res.data)['access_token']
    
    # Create team
    res_team = client.post('/api/teams', json={'name': 'Task Team'}, headers={'Authorization': f'Bearer {token}'})
    team_id = json.loads(res_team.data)['team']['id']
    
    return {'token': token, 'team_id': team_id}

def test_create_task(client, auth_data):
    token = auth_data['token']
    team_id = auth_data['team_id']
    
    response = client.post('/api/tasks', json={
        'team_id': team_id,
        'title': 'Test Task',
        'description': 'A task for testing',
        'priority': 'high'
    }, headers={'Authorization': f'Bearer {token}'})
    
    data = json.loads(response.data)
    assert response.status_code == 201
    assert data['task']['title'] == 'Test Task'
    assert data['task']['status'] == 'todo'
    assert data['task']['priority'] == 'high'

def test_get_tasks(client, auth_data):
    token = auth_data['token']
    team_id = auth_data['team_id']
    
    # Create 2 tasks
    client.post('/api/tasks', json={'team_id': team_id, 'title': 'Task 1', 'status': 'todo'}, headers={'Authorization': f'Bearer {token}'})
    client.post('/api/tasks', json={'team_id': team_id, 'title': 'Task 2', 'status': 'completed'}, headers={'Authorization': f'Bearer {token}'})
    
    # Get all tasks
    response = client.get(f'/api/tasks?team_id={team_id}', headers={'Authorization': f'Bearer {token}'})
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data['tasks']) >= 2

    # Filter tasks
    res_filtered = client.get(f'/api/tasks?team_id={team_id}&status=completed', headers={'Authorization': f'Bearer {token}'})
    data_filtered = json.loads(res_filtered.data)
    assert len(data_filtered['tasks']) == 1
    assert data_filtered['tasks'][0]['title'] == 'Task 2'

def test_update_task(client, auth_data):
    token = auth_data['token']
    team_id = auth_data['team_id']
    
    # Create task
    res = client.post('/api/tasks', json={'team_id': team_id, 'title': 'Old Title'}, headers={'Authorization': f'Bearer {token}'})
    task_id = json.loads(res.data)['task']['id']
    
    # Update task
    update_res = client.put(f'/api/tasks/{task_id}', json={
        'title': 'New Title',
        'status': 'in_progress'
    }, headers={'Authorization': f'Bearer {token}'})
    
    data = json.loads(update_res.data)
    assert update_res.status_code == 200
    assert data['task']['title'] == 'New Title'
    assert data['task']['status'] == 'in_progress'

def test_delete_task(client, auth_data):
    token = auth_data['token']
    team_id = auth_data['team_id']
    
    # Create task
    res = client.post('/api/tasks', json={'team_id': team_id, 'title': 'Delete Me'}, headers={'Authorization': f'Bearer {token}'})
    task_id = json.loads(res.data)['task']['id']
    
    # Delete task
    del_res = client.delete(f'/api/tasks/{task_id}', headers={'Authorization': f'Bearer {token}'})
    assert del_res.status_code == 200
    
    # Verify deletion
    get_res = client.get(f'/api/tasks/{task_id}', headers={'Authorization': f'Bearer {token}'})
    assert get_res.status_code == 404
