import {useEffect, useState} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
// onAuthStateChanged => everytime the state changes, if we go from logged in to not logged in, then this will fire off


export const useAuthStatus = () => {
  // State
  const [loggedIn, setLoggedIn] = useState(false) //by default = not logged in
  const [checkingStatus, setCheckingStatus] = useState(true) // this is similar to [loading]

  // Logic: check if user is logged in then right after we get the response, then we set checkstatus to 'false' (since no more loading) then [loggedIn] to 'true'

  useEffect(()=> {
    // initialize Auth
    const auth = getAuth()

    // onAuthStateChanged params => auth, then a function that has a 'user' argument
    onAuthStateChanged(auth, (user)=>{
      if(user) {
        setLoggedIn(true)
      }
      setCheckingStatus(false) // if user is logged in then set the checkingStatus to false (since no more loading)
    })
  })

  // Return your state variables
  return { loggedIn, checkingStatus}
}
