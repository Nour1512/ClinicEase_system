from repositories.patient_repository import PatientRepository


class RepositoryFactory:
    @staticmethod
    def get_repository(entity_type):
        if entity_type == "patient":
            return PatientRepository()
        # elif entity_type == "product":
        #     return ProductRepository()
        else:
            raise ValueError("Unknown repository type")