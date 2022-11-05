import {useState} from 'react'
import {Link} from 'react-router-dom'
import {getAuth, sendPasswordResetEmail} from 'firebase/auth'
import {toast} from 'react-toastify'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'

function ForgotPassword() {
  // State for email input
  const [email, setEmail] = useState('') //empty by default

  // functions
  const onChange = e => setEmail(e.target.value)

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      // initialize Auth variable
      const auth = getAuth()

      // send reset password email (await since it returns promise)
      // sendPasswordResetEmail(auth, email) params => auth, then the email value on input field
      await sendPasswordResetEmail(auth, email)
      toast.success('Email was sent')

    } catch(error) {
      toast.error('could not send reset email')
    }
  }


  ////////////////////////////
  return (
    <div className='pagecontainer'>
      <header>
        <p className="pageHeader">Forgot Password</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          {/* value={email} => email came from the email state */}
          <input type="email" placeholder='Email' id='email' value={email} onChange={onChange} className="emailInput" />

          {/* After submitting, redirect to sign in */}
          <Link className='forgotPasswordLink' to='/sign-in'>Sign In</Link>

          {/* Sign-in bar */}
          <div className="signInBar">
            <div className="signInText">Send Reset Link</div>
            <button className="signInButton">
              <ArrowRightIcon fill='#fff' width='34px' height='34px' />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ForgotPassword