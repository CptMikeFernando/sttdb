from flask import Flask, send_from_directory, jsonify, request
import psycopg2
import os

app = Flask(__name__, static_folder='docs')

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS poll_votes (
            id SERIAL PRIMARY KEY,
            team VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()

@app.route('/')
def index():
    return send_from_directory('docs', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('docs', path)

@app.route('/api/poll/vote', methods=['POST'])
def vote():
    data = request.get_json()
    team = data.get('team')
    if not team:
        return jsonify({'error': 'Team required'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO poll_votes (team) VALUES (%s)', (team,))
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/poll/results')
def results():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT team, COUNT(*) as votes 
        FROM poll_votes 
        GROUP BY team 
        ORDER BY votes DESC
    ''')
    rows = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM poll_votes')
    total_row = cur.fetchone()
    total = total_row[0] if total_row else 0
    cur.close()
    conn.close()
    
    results = {}
    for row in rows:
        results[row[0]] = {
            'votes': row[1],
            'percentage': round((row[1] / total * 100), 1) if total > 0 else 0
        }
    
    return jsonify({'results': results, 'total': total})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
