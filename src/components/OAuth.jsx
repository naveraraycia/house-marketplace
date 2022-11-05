import {useLocation, useNavigate} from 'react-router-dom'
import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'
// for updating main firestore database
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'

function OAuth() {
  // initialize hooks
  const navigate = useNavigate() // allows you to navigate to another path / page
  const location = useLocation() // allows you to check your URL paths / pathname

  // function => onGoogleClick
  async function onGoogleClick() {
    try {
      // initialize auth
      const auth = getAuth()
      // Create a provider (this part allows you to set the provider for your new account to 'Google' provider)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // create document reference
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      
      // check to see if this user exist, if it does not then we must register the user (to know if sign in or sign up)
      if(!docSnap.exists()) {
        // if the user does not exist yet then create user on database
        // params of doc => db from firebase.config, name of collection (table), then the user ID in Authentication
        // params of setDoc => doc(), then what data you want to add to the collection database
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp() //gathers server timestamp
        })
      }
      // Once user is signed in or signed up with google, they will navigate to explore page
      navigate('/')

    } catch (error) {
      toast.error('Could not authorize with Google')
    }
  }

  return (
    <div className="socialLogin">
      {/* Conditional => look at the URL whether you are in sign-in page or sign-up page */}
      <p>Sign {location.pathname === '/sign-up' ? 'up' : 'in'} with</p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img className='socialIconImg' src={googleIcon} alt="google" />
      </button>
    </div>
  )
}

export default OAuth