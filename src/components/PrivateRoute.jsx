import {Navigate, Outlet} from 'react-router-dom'
// Navigate => used to navigate through pages
// Outlet => allows you to return child elements
import { useAuthStatus } from '../hooks/useAuthStatus'
// import custom Hook for checking if user is logged in
// import Spinner component
import Spinner from './Spinner'

const PrivateRoute = () => {
  // de-structure from useAuthStatus
  const { loggedIn, checkingStatus } = useAuthStatus()

  if(checkingStatus) {
    // if checkingStatus is true => it means data is loading
    return <Spinner />
  }

  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoute