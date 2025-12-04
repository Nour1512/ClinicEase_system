class Admin:
    def __init__(self, admin_id, full_name, email, password):
        self.admin_id = admin_id
        self.full_name = full_name
        self.email = email
        self.password = password

    @classmethod
    def from_dict(cls, data):
        """Create an Admin instance from a dictionary (e.g., from a database row)."""
        return cls(
            admin_id=data['Admin_id'],      # Note: your column is 'Admin_id' (capital A)
            full_name=data['full_name'],
            email=data['email'],
            password=data['password']
        )