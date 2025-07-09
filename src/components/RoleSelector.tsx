import { roles } from '../constants/roles';

const RoleSelector = () => {
    return(
        <div className="role-selector flex gap-2">
            {(Object.keys(roles) as Array<keyof typeof roles>).map(role => {
                console.log(role);
                return <img key={role} src={roles[role]} alt={role} /> 
            })}
        </div>
    )
}

export default RoleSelector;