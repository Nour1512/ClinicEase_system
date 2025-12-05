# Steps for implementing 
1- hat3ml method get patient by id flbackend btfetch elpatient details ashan t call el api request dy lma eluser (Admin) yclick on elpatient yzhar kol el details bta3t el patient  (name, dob, etc..), Ex. Admin see patient list -> Admin clicks on a specific patient -> The patient details appears in a page 
 
2- pharmacy should have (get request for the doctor role) (post request for adding medicine for the admin page) (update request for the patient -> This should update el quantity aw elstock fl api method quantity = quantity - 1), hat3ml el functions dy flbackend wtcall them flfront end lkol page 
, lazem tcheck en el methods btcommunicate m3 eldatabase



3- inventory should have the following functionalities:
    - the patient should be able to view inventory (Get Request) 
    - the patient should be able to buy medicine (Update Request for the stock)
    - the doctor should be able to view inventory (Get Request)
    - the admin should be able to add medicine to the inventory (POST Request) 
    - the admin should be able to view inventory (Get Request)
    - the admin should be able to delete medicine from inventory (Delete Request)

How: 
    hat3ml el crud operations (Get, post, update, delete) only once, then you'll call these methods fkol page hat7taghom feha (Ex. Admin.html or pharmacy.html)






# NEXT STEPS


- hatget el role bta3t el signed in user (Admin, patient, doctor)
- css hthandle en elbutton bta3 new medicine yb2a -hidden law el role dy msh admin 
- elbuy button lazm yb2a button flba2y wyb2a bardo hidden law el role dy msh patient (patient only should buy medicine)
- el buy api m3mol already hatintegrate elbuy da bas m3 el html w tcall el method bta3to, momkn tzwd counter quantity flfrontend ashan el patient ykhtar awez yshtry ad eh mn elmedicine da 
- hattest el database b3d kol method tzwdha wtt2kd enha bttghyr m3 kol update (Add medicina, buy, get)

