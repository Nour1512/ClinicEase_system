class AdminFeedback:
    def __init__(self, **kwargs):
        self.Id = kwargs.get('Id')
        self.AdminName = kwargs.get('AdminName')
        self.Comments = kwargs.get('Comments')
        self.Author = kwargs.get('Author')
        self.Rating = kwargs.get('Rating')
        self.Review = kwargs.get('Review')
        self.PatientInfo = kwargs.get('PatientInfo')
        self.SubmittedOn = kwargs.get('SubmittedOn')
        self.Status = kwargs.get('Status', 'pending')
        self.Actions = kwargs.get('Actions')
