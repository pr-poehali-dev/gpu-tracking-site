import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin panel - get all users, queue data, and database stats
    Args: event with httpMethod, headers (X-User-Role for auth check)
    Returns: Admin dashboard data with users and queue statistics
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Role',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_role = headers.get('X-User-Role') or headers.get('x-user-role')
    
    if user_role != 'admin':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Admin access required'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute("""
            SELECT id, username, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        """)
        users = []
        for row in cur.fetchall():
            users.append({
                'id': row[0],
                'username': row[1],
                'role': row[2],
                'created_at': row[3].isoformat() if row[3] else None
            })
        
        cur.execute("""
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting,
                   COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            FROM queue
        """)
        stats = cur.fetchone()
        
        cur.execute("""
            SELECT id, user_id, username, gpu_name, duration_minutes, 
                   start_time, end_time, status, position, created_at
            FROM queue
            ORDER BY created_at DESC
            LIMIT 50
        """)
        
        all_queue = []
        for row in cur.fetchall():
            all_queue.append({
                'id': row[0],
                'user_id': row[1],
                'username': row[2],
                'gpu_name': row[3],
                'duration_minutes': row[4],
                'start_time': row[5].isoformat() if row[5] else None,
                'end_time': row[6].isoformat() if row[6] else None,
                'status': row[7],
                'position': row[8],
                'created_at': row[9].isoformat() if row[9] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'users': users,
                'queue_stats': {
                    'total': stats[0],
                    'waiting': stats[1],
                    'active': stats[2],
                    'completed': stats[3]
                },
                'all_queue': all_queue
            }),
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
