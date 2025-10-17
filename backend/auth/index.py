import json
import os
import hashlib
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication and registration with role selection
    Args: event with httpMethod, body (username, password, role for register/login)
    Returns: HTTP response with user data and role
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        username = body_data.get('username', '').strip()
        password = body_data.get('password', '').strip()
        role = body_data.get('role', 'user')
        student_group = body_data.get('student_group', 'Группа 1')
        
        if not username or not password:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Username and password required'}),
                'isBase64Encoded': False
            }
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if action == 'register':
            try:
                cur.execute(
                    "INSERT INTO users (username, password, role, student_group) VALUES (%s, %s, %s, %s) RETURNING id, username, role, student_group, created_at",
                    (username, password_hash, role, student_group)
                )
                user = cur.fetchone()
                conn.commit()
                
                result = {
                    'success': True,
                    'user': {
                        'id': user[0],
                        'username': user[1],
                        'role': user[2],
                        'student_group': user[3],
                        'created_at': user[4].isoformat() if user[4] else None
                    }
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                cur.close()
                conn.close()
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username already exists'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'login':
            cur.execute(
                "SELECT id, username, role, student_group, created_at FROM users WHERE username = %s AND password = %s",
                (username, password_hash)
            )
            user = cur.fetchone()
            
            if user:
                result = {
                    'success': True,
                    'user': {
                        'id': user[0],
                        'username': user[1],
                        'role': user[2],
                        'student_group': user[3],
                        'created_at': user[4].isoformat() if user[4] else None
                    }
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }