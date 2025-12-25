# tests/test_patient_feedback_controller.py
from unittest.mock import patch, MagicMock
from controllers.p_feedback_controller import PatientFeedbackController

# Test save_feedback success
@patch("controllers.p_feedback_controller.PatientFeedbackRepository")
@patch("controllers.p_feedback_controller.PatientFeedback")
def test_save_feedback_success(mock_feedback_class, mock_repo_class):
    mock_feedback_instance = MagicMock()
    mock_feedback_instance.validate.return_value = []
    mock_feedback_class.return_value = mock_feedback_instance
    mock_repo = mock_repo_class.return_value

    controller = PatientFeedbackController()
    data = {
        'patient_name': 'John Doe',
        'gender': 'Male',
        'doctor_knowledge': 5,
        'doctor_kindness': 4,
        'nurse_patience': 5,
        'nurse_knowledge': 4,
        'waiting_time': 3,
        'hygiene': 5,
        'improvement_suggestions': 'None'
    }

    result = controller.save_feedback(data)
    assert result['success'] is True
    assert 'Feedback saved successfully' in result['message']
    mock_feedback_instance.validate.assert_called_once()
    mock_repo.save_feedback.assert_called_once_with(mock_feedback_instance)


# Test save_feedback with validation error
@patch("controllers.p_feedback_controller.PatientFeedbackRepository")
@patch("controllers.p_feedback_controller.PatientFeedback")
def test_save_feedback_validation_error(mock_feedback_class, mock_repo_class):
    mock_feedback_instance = MagicMock()
    mock_feedback_instance.validate.return_value = ["Invalid rating"]
    mock_feedback_class.return_value = mock_feedback_instance

    controller = PatientFeedbackController()
    data = {'patient_name': 'John Doe'}
    result = controller.save_feedback(data)
    assert result['success'] is False
    assert 'Invalid rating' in result['message']
    mock_feedback_instance.validate.assert_called_once()


# Test save_feedback with exception
@patch("controllers.p_feedback_controller.PatientFeedbackRepository")
@patch("controllers.p_feedback_controller.PatientFeedback")
def test_save_feedback_exception(mock_feedback_class, mock_repo_class):
    mock_feedback_class.side_effect = Exception("Creation failed")
    controller = PatientFeedbackController()
    data = {'patient_name': 'John Doe'}
    result = controller.save_feedback(data)
    assert result['success'] is False
    assert 'Creation failed' in result['message']


# Test get_all_feedback
@patch("controllers.p_feedback_controller.PatientFeedbackRepository")
def test_get_all_feedback(mock_repo_class):
    mock_repo = mock_repo_class.return_value
    mock_repo.get_all_feedback.return_value = ['feedback1', 'feedback2']

    controller = PatientFeedbackController()
    result = controller.get_all_feedback()
    assert result == ['feedback1', 'feedback2']


# Test get_feedback_stats
@patch("controllers.p_feedback_controller.PatientFeedbackRepository")
def test_get_feedback_stats(mock_repo_class):
    mock_repo = mock_repo_class.return_value
    mock_repo.get_feedback_stats.return_value = {'average_rating': 4.5}

    controller = PatientFeedbackController()
    result = controller.get_feedback_stats()
    assert result == {'average_rating': 4.5}