import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage GPU queue - add to queue, get queue status, update positions
    Args: event with httpMethod, body (user_id, gpu_name, duration_minutes)
    Returns: Queue data with positions and timers
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute("""
            SELECT q.id, q.user_id, q.username, q.gpu_name, q.duration_minutes, 
                   q.start_time, q.end_time, q.status, q.position, q.created_at, q.student_group
            FROM queue q
            WHERE q.status IN ('waiting', 'active')
            ORDER BY q.position ASC, q.created_at ASC
        """)
        
        queue_items = []
        for row in cur.fetchall():
            item = {
                'id': row[0],
                'user_id': row[1],
                'username': row[2],
                'gpu_name': row[3],
                'duration_minutes': row[4],
                'start_time': row[5].isoformat() if row[5] else None,
                'end_time': row[6].isoformat() if row[6] else None,
                'status': row[7],
                'position': row[8],
                'created_at': row[9].isoformat() if row[9] else None,
                'student_group': row[10] or 'Без группы'
            }
            queue_items.append(item)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'queue': queue_items}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        username = body_data.get('username')
        gpu_name = body_data.get('gpu_name')
        duration_minutes = body_data.get('duration_minutes', 30)
        student_group = body_data.get('student_group', 'Группа 1')
        
        cur.execute("SELECT COUNT(*) FROM queue WHERE status IN ('waiting', 'active')")
        position = cur.fetchone()[0] + 1
        
        cur.execute("""
            INSERT INTO queue (user_id, username, gpu_name, duration_minutes, status, position, student_group)
            VALUES (%s, %s, %s, %s, 'waiting', %s, %s)
            RETURNING id, position, created_at
        """, (user_id, username, gpu_name, duration_minutes, position, student_group))
        
        result = cur.fetchone()
        conn.commit()
        
        response_data = {
            'success': True,
            'queue_id': result[0],
            'position': result[1],
            'created_at': result[2].isoformat() if result[2] else None
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(response_data),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        queue_id = body_data.get('queue_id')
        action = body_data.get('action')
        
        if action == 'start':
            now = datetime.utcnow()
            cur.execute("""
                UPDATE queue 
                SET status = 'active', 
                    start_time = %s,
                    end_time = %s + INTERVAL '%s minutes'
                WHERE id = %s
                RETURNING id, start_time, end_time
            """, (now, now, body_data.get('duration_minutes', 30), queue_id))
            
            result = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'start_time': result[1].isoformat() if result[1] else None,
                    'end_time': result[2].isoformat() if result[2] else None
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'complete':
            cur.execute("UPDATE queue SET status = 'completed' WHERE id = %s", (queue_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
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