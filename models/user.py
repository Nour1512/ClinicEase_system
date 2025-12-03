class User:
    def __init__(self, id, name, email):
        self.id = id
        self.name = name
        self.email = email
    @staticmethod
    def get_all():
        return [
            User(1, "Ahmed", "Ahmed@example.com"),
            User(2, "Sherif", "Ali@example.com"),
            User(3, "Mohamed", "Mohamed@example.com"),
        ]
    @staticmethod
    def get_by_id(id):
        for user in User.get_all():
            if user.id == id:
                return user
        return None  