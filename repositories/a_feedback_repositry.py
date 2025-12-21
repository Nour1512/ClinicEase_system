# repositories/a_feedback_repository.py

from datetime import datetime
from models.a_feedback import Feedback

class FeedbackRepository:

    _feedback_data = [
        Feedback(
            id=1,
            author_name="Carlos J.",
            author_email="carlosj@gmail.com",
            author_ip="49.207.218.36",
            rating=4,
            review_text="Great display, but the headset is a bit heavy. Still a big step up from my previous VR headset.",
            product_name="HTC Vive Pro 2",
            product_url="/products/htc-vive-pro-2",
            submitted_at=datetime(2025, 11, 4, 10, 33),
            status='pending',
            feedback_type='review'
        ),
        Feedback(
            id=2,
            author_name="Lena M.",
            author_email="lenamenon@gmail.com",
            author_ip="49.207.218.36",
            rating=5,
            review_text="Perfect for Racing & Flight Sims. Perfect for sim racing and flight sims. Colors are vivid and text is crisp even at close range.",
            product_name="HTC Vive Pro 2",
            product_url="/products/htc-vive-pro-2",
            submitted_at=datetime(2025, 11, 4, 10, 32),
            status='pending',
            feedback_type='review'
        ),
        Feedback(
            id=3,
            author_name="Dev Patel",
            author_email="devpatel91@gmail.com",
            author_ip="49.207.218.36",
            rating=4,
            review_text="Comfort is good for long sessions and the resolution is superb. Would love slightly better audio out of the box.",
            product_name="HTC Vive Pro 2",
            product_url="/products/htc-vive-pro-2",
            submitted_at=datetime(2025, 11, 4, 10, 31),
            status='pending',
            feedback_type='review'
        ),
        Feedback(
            id=4,
            author_name="Asha R.",
            author_email="ashr@gmail.com",
            author_ip="49.207.218.36",
            rating=5,
            review_text="Incredible Visuals and Immersion. Image clarity and tracking are outstanding. Set up took a little time but the end result is immersive and worth it.",
            product_name="HTC Vive Pro 2",
            product_url="/products/htc-vive-pro-2",
            submitted_at=datetime(2025, 11, 4, 10, 31),
            status='pending',
            feedback_type='review'
        ),
       
    ]

    def get_all_feedback(self, status='all', feedback_type='all_types', rating='all_ratings', search_term=''):
      
        filtered = self._feedback_data

        if status != 'all':
            filtered = [f for f in filtered if f.status == status]

        if feedback_type != 'all_types':
            filtered = [f for f in filtered if f.feedback_type == feedback_type]

        if rating != 'all_ratings':
            try:
                rating_num = int(rating)
                filtered = [f for f in filtered if f.rating == rating_num]
            except ValueError:
                pass  

        if search_term:
            search_term = search_term.lower()
            filtered = [f for f in filtered if (
                search_term in f.author_name.lower() or
                search_term in f.author_email.lower() or
                search_term in f.review_text.lower() or
                search_term in f.product_name.lower()
            )]

        return filtered

    def get_feedback_by_id(self, feedback_id):
    
        for feedback in self._feedback_data:
            if feedback.id == feedback_id:
                return feedback
        return None

    def delete_feedback(self, feedback_id):
        
        original_len = len(self._feedback_data)
        self._feedback_data = [f for f in self._feedback_data if f.id != feedback_id]
        return len(self._feedback_data) < original_len

    def update_feedback_status(self, feedback_id, new_status):
       
        feedback = self.get_feedback_by_id(feedback_id)
        if feedback:
            feedback.status = new_status
            return True
        return False

    def add_feedback(self, feedback):
  
        feedback.id = max([f.id for f in self._feedback_data], default=0) + 1
        self._feedback_data.append(feedback)
        return feedback.id