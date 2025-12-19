const Permission=require("../Schema/Permission")


async function SendPermissions(){
const permissions=[{name:"create-user"},
    {name:"update-user"},
    {name:"delete-user"},{
        name:"list-users"
    },{name:"manage-roles"},{
        name:"view-profile"
    }
]

for(const perms of permissions){
    const hasPermission= await Permission.findOne({name:perms.name})
    if(!hasPermission){
        const newPerm=await Permission.create(perms)
        console.log(`${newPerm} created`)
    }
}
}

module.exports={SendPermissions}


