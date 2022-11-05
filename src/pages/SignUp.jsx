import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
// Icons SVG from assets folder
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
// No need to put as {ReactComponent} since this svg will just be used as an img src
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
///////////
// Import from Firebase Auth to be able to register users using Google Acc / email & pwd
import {getAuth, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
// import database
import { db } from '../firebase.config'

// Import firestore functions
import {setDoc, doc, serverTimestamp} from 'firebase/firestore'

// import toast
import {toast} from 'react-toastify'
// import OAuth
import OAuth from '../components/OAuth'






function SignUp() {
  ///////////////////// THIS IS WHERE YOUR VARIABLES, STATES, FUNCTIONS GO
  // For showing the password when Icon is clicked
  const [showPassword, setShowPassword] = useState(false) // by default, password is encrypted
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  })

  // If we want to use 'email', and 'password' from above => we must destructure 
  // To be used for the value attr for input fields
  const {email, password, name} = formData

  // Initialize {useNavigate}
  const navigate = useNavigate()

  // onChange Function => for updating the fromData state and allowing the input function to work (because with onChange being empty => you cannot type within the input field)
  const onChange = (e) => {

    // Put data on formData state
    setFormData((prevState) => ({
      ...prevState, // spread across the previous state content
      // [e.target.id] will give us the tag of the element (either email or pwd)
      // It gets the value of the input field based on which ID (email or pwd input field)
      // To make this work, make sure your useState keys on formData is the same exact word / variable with your ID
      [e.target.id]: e.target.value
    }))
  }

  // onSubmit Function => for submitting the form
  const onSubmit = async (e) => {
    e.preventDefault()

    // We used try catch since we are not using the .then promise type of code
    try {
      // Register the user here

      const auth = getAuth()

      const userCredential = await createUserWithEmailAndPassword(auth, email, password) //auth, email, password => comes from our form input field

      const user = userCredential.user // get the user from userCredential since we need this for the database

      // update the user's profile
      // the args will be the Current user (auth.currentUser) and then the object that sets the display name, which shall be the input field {name}
      updateProfile(auth.currentUser, {
        displayName: name
      })


      //////////////////// PLACE DATA TO FIRESTORE ///////////////////

      // Create a copy of the formData state for the firestore DB
      const formDataCopy = {...formData}

      delete formDataCopy.password // delete the password part since we dont want to put it on the database

      formDataCopy.timestamp = serverTimestamp()  // add an object property called 'timestamp' to be able to get the time the user has registered

      // await since setdoc returns a promise
      // setDoc() updates the database and adds the user info to the 'users' collection (table)
      // setDoc params => doc(db, user.uid), formDataCopy
      // db => imported db from firebase.config file
      // user.uid => from const user = userCredential.user above
      // 'users' => the name of the collection
      // formDataCopy = copy of the formData state (object)
      await setDoc(doc(db, 'users', user.uid), formDataCopy) 

      // Afer successfully registering the user, navigate to the home page
      navigate('/')

    } catch (error) {
      toast.error('Something went wrong with registration')

    }

  }



  ////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    /////////////////////  THIS IS WHERE THE HTML STRUCTURE GO
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">
            Welcome Back!
          </p>
        </header>

        <main>
          <form onSubmit={onSubmit}>
            {/* the ID must be same with the name in the formState */}
            <input type="text" className='nameInput' placeholder='Name' id='name' value={name} onChange={onChange} />


            {/* value => {email} we destructured from formData state */}
            {/* onChange is a function */}
            {/* the ID must be same with the name in the formState */}
            <input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange} />

            <div className="passwordInputDiv">
              {/* Type is conditional since if it is show password then the type='text', if it is hide or encrypted password, it must be type='password' */}

              {/* If state showPassword is true then type='text'  else type='password'*/}
              {/* value => {password} we destructured from formData state */}
              {/* the ID must be same with the name in the formState */}
              <input type={showPassword ? 'text' : 'password'} placeholder='Password' className='passwordInput' id='password' value={password} onChange={onChange} />

              {/* show Pwd Icon */}
              {/* onClick={() => setShowPassword((prevState)=> !prevState )} */}
              {/* The code above means when you click the icon, you will call setShowPassword */}
              {/* What setShowPassword's arg will be is the opposite of its previous state (either true or false in order to toggle) */}
              <img src={visibilityIcon} alt="show password" className="showPassword" onClick={() => setShowPassword((prevState)=> !prevState )} />
              
            </div>

            {/* Link to Forgot Password Page */}
            {/* Note: <Link> is similar to <a> anchor tag */}
            <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password</Link>

            {/* Sign in button */}
            <div className="signUpBar">
              <p className="signUpText">Sign Up</p>
              <button className='signUpButton'>
                {/* Arrow icon within btn */}
                <ArrowRightIcon fill='#fff' width='34px' height='34px' />
              </button>
            </div>
          </form>

          <OAuth />


          <Link to='/sign-in' className='registerLink'>Sign In Instead</Link>
        </main>
      </div>
    </>
  )
}

export default SignUp