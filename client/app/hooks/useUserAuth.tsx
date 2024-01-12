import { useSelector } from 'react-redux';

export default function useUserAuth() {
    const { user } = useSelector((state: any) => state.auth);

    if (user) {
        return true;
    } else {
        return false;
    }
}
