import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
// Icons SVG from assets folder
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
// No need to put as {ReactComponent} since this svg will just be used as an img src
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
// import from firebase
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'
// import toast
import {toast} from 'react-toastify'
// Import OAuth component
import OAuth from '../components/OAuth'


function SignIn() {
  ///////////////////// THIS IS WHERE YOUR VARIABLES, STATES, FUNCTIONS GO
  // For showing the password when Icon is clicked
  const [showPassword, setShowPassword] = useState(false) // by default, password is encrypted
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // If we want to use 'email', and 'password' from above => we must destructure
  // To be used for the value attr for input fields
  const {email, password} = formData

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

  // onSubmit function => for the sign in functionality
  const onSubmit = async (e) => {
    e.preventDefault()

    try{
       // Initialize Auth
      const auth = getAuth()

      // Put to variable since the function returns a promise
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      if(userCredential.user) {
        navigate('/')
      }
    } catch (error) {
      toast.error('Bad User Credentials')
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
            <div className="signInBar">
              <p className="signInText">Sign In</p>
              <button className='signInButton'>
                {/* Arrow icon within btn */}
                <ArrowRightIcon fill='#fff' width='34px' height='34px' />
              </button>
            </div>
          </form>

          <OAuth />

          <Link to='/sign-up' className='registerLink'>Sign Up Instead</Link>
        </main>
      </div>
    </>
  )
}

export default SignIn