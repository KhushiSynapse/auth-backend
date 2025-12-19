const Role=require("../Schema/Role")
const Permission=require("../Schema/Permission")

async function AttachPermissions(){
    const createUser=await Permission.findOne({name:"create-user"})
    const deleteUser=await Permission.findOne({name:"create-user"})
    const updateUser=await Permission.findOne({name:"create-user"})
    const listUser=await Permission.findOne({name:"create-user"})
    const viewProfile=await Permission.findOne({name:"create-user"})
    const manageRole=await Permission.findOne({name:"create-user"})


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