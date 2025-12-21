# models/a_feedback.py

class Feedback:
    def __init__(self, id, author_name, author_email, author_ip, rating, review_text, product_name, product_url, submitted_at, status='pending', feedback_type='review'):
        self.id = id
        self.author_name = author_name
        self.author_email = author_email
        self.author_ip = author_ip
        self.rating = rating  
        self.review_text = review_text
        self.product_name = product_name
        self.product_url = product_url
        self.submitted_at = submitted_at 
        self.status = status  # pending, approved, spam, trash
        self.feedback_type = feedback_type  # review, comment

    @property
    def is_approved(self):
        return self.status == 'approved'

    @property
    def is_spam(self):
        return self.status == 'spam'

    @property
    def is_trash(self):
        return self.status == 'trash'

    @property
    def star_rating_display(self):
      
        filled_stars = '★' * self.rating
        empty_stars = '☆' * (5 - self.rating)
        return filled_stars + empty_stars

    def to_dict(self):
        return {
            'id': self.id,
            'author_name': self.author_name,
            'author_email': self.author_email,
            'author_ip': self.author_ip,
            'rating': self.rating,
            'review_text': self.review_text,
            'product_name': self.product_name,
            'product_url': self.product_url,
            'submitted_at': self.submitted_at.isoformat() if hasattr(self.submitted_at, 'isoformat') else str(self.submitted_at),
            'status': self.status,
            'feedback_type': self.feedback_type
        }