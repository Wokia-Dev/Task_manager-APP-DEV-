import json

def test_register(client):
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123',
        'full_name': 'Test User'
    })
    data = json.loads(response.data)
    assert response.status_code == 201
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['username'] == 'testuser'

def test_login(client):
    # First register
    client.post('/api/auth/register', json={
        'username': 'testuser2',
        'email': 'test2@example.com',
        'password': 'password123',
        'full_name': 'Test User 2'
    })
    
    # Then login
    response = client.post('/api/auth/login', json={
        'email': 'test2@example.com',
        'password': 'password123'
    })
    data = json.loads(response.data)
    assert response.status_code == 200
    assert 'access_token' in data
    assert data['user']['username'] == 'testuser2'

def test_login_invalid(client):
    response = client.post('/api/auth/login', json={
        'email': 'notfound@example.com',
        'password': 'password123'
    })
    assert response.status_code == 401
