import json
import pytest

@pytest.fixture
def auth_token(client):
    client.post('/api/auth/register', json={
        'username': 'teamuser',
        'email': 'teamuser@example.com',
        'password': 'password123',
        'full_name': 'Team User'
    })
    res = client.post('/api/auth/login', json={
        'email': 'teamuser@example.com',
        'password': 'password123'
    })
    return json.loads(res.data)['access_token']

def test_create_team(client, auth_token):
    response = client.post('/api/teams', json={'name': 'My Test Team'}, headers={'Authorization': f'Bearer {auth_token}'})
    data = json.loads(response.data)
    assert response.status_code == 201
    assert data['team']['name'] == 'My Test Team'
    assert 'invite_code' in data['team']

def test_join_team(client, auth_token):
    # User 1 creates team
    res1 = client.post('/api/teams', json={'name': 'Joinable Team'}, headers={'Authorization': f'Bearer {auth_token}'})
    invite_code = json.loads(res1.data)['team']['invite_code']

    # User 2 registers
    client.post('/api/auth/register', json={
        'username': 'joiner',
        'email': 'joiner@example.com',
        'password': 'password123',
        'full_name': 'Joiner User'
    })
    res2 = client.post('/api/auth/login', json={
        'email': 'joiner@example.com',
        'password': 'password123'
    })
    token2 = json.loads(res2.data)['access_token']

    # User 2 joins team
    response = client.post('/api/teams/join', json={'invite_code': invite_code}, headers={'Authorization': f'Bearer {token2}'})
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['team']['name'] == 'Joinable Team'

    # Verify members
    members_res = client.get(f"/api/teams/{data['team']['id']}/members", headers={'Authorization': f'Bearer {auth_token}'})
    members_data = json.loads(members_res.data)
    assert len(members_data['members']) == 2
