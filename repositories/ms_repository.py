from core.db_singleton import db
 # Singleton DatabaseConnection
from models.ms import Medicine

class MedicineStockRepository:

    def get_all(self):
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM medicines ORDER BY id DESC")
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
       
        for d in data:
            d['expiration_date'] = d.pop('expiry', None)  
        return data

    def search(self, query):
        conn = db.get_connection()
        cursor = conn.cursor()
        q = f"%{query}%"
        cursor.execute("""
            SELECT * FROM medicines
            WHERE name LIKE ? OR description LIKE ? OR category LIKE ? OR manufacturer LIKE ?
            ORDER BY id DESC
        """, (q, q, q, q))
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        for d in data:
            d['expiration_date'] = d.pop('expiry', None)
        return data

    def create(self, data):
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO medicines
            (name, description, category, manufacturer, price, quantity, expiry, batch_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('name'),
            data.get('description'),
            data.get('category'),
            data.get('manufacturer'),
            data.get('price'),
            data.get('quantity'),
            data.get('expiration_date'),
            data.get('batch_number')
        ))
        conn.commit()
        medicine_id = cursor.lastrowid
        return Medicine.from_dict({**data, 'id': medicine_id})

    def update(self, medicine_id, data):
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE medicines SET
            name=?, description=?, category=?, manufacturer=?, price=?, quantity=?, expiry=?, batch_number=?
            WHERE id=?
        """, (
            data.get('name'),
            data.get('description'),
            data.get('category'),
            data.get('manufacturer'),
            data.get('price'),
            data.get('quantity'),
            data.get('expiration_date'),
            data.get('batch_number'),
            medicine_id
        ))
        conn.commit()
        if cursor.rowcount == 0:
            return None
        return Medicine.from_dict({**data, 'id': medicine_id})

    def delete(self, medicine_id):
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM medicines WHERE id=?", (medicine_id,))
        conn.commit()
        return cursor.rowcount > 0
