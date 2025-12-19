const Role=require("../Schema/Role")
const Permission=require("../Schema/Permission")

async function AttachPermissions(){
    const createUser=await Permission.findOne({name:"create-user"})
    const deleteUser=await Permission.findOne({name:"delete-user"})
    const updateUser=await Permission.findOne({name:"update-user"})
    const listUser=await Permission.findOne({name:"list-user"})
    const viewProfile=await Permission.findOne({name:"view-profile"})
    const manageRole=await Permission.findOne({name:"manage-roles"})


    const adminRole=await Role.findOne({name:"admin"})
        if (!adminRole){
             await Role.create({name:"admin",
                permissions:[createUser._id,
                    deleteUser._id,
                    updateUser._id,
                    listUser._id,
                    viewProfile._id,
                    manageRole._id

                ]
             })
        }

         const managerRole=await Role.findOne({name:"manager"})
        if (!managerRole){
             await Role.create({name:"manager",
                permissions:[
                    
                    listUser._id,
                    viewProfile._id,
                  

                ]
             })
        }

         const userRole=await Role.findOne({name:"user"})
        if (!userRole){
             await Role.create({name:"admin",
                permissions:[
                    
                    viewProfile._id,
                   

                ]
             })
        }
    
}

module.exports={AttachPermissions}