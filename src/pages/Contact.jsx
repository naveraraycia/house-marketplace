import {useState, useEffect} from 'react'
// useParams => gets the direct parameter value from url (/vPyghlyLS     part) (http://localhost:3000/contact/vPyghlyLSlVQKetavSNxpJTeQuW2?listingName=Beautiful%20Stratford%20Condo)
// useSearch Params => gets the value of listingName in example (?listingName=Beautiful Stratford Condo)
import {useParams, useSearchParams } from 'react-router-dom'
// get user document from firebase since we need the email
import {doc, getDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'


function Contact() {
  const [message, setMessage] = useState('')
  const [landlord, setLandlord] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams() // gets the value of URL param = listingName

  // get id in the URL
  const params = useParams()

  // Fetch the user with useEffect()
  useEffect(()=>{
    const getLandlord = async () => {
      // get reference
      // doc params => db (from firebase.config file), 'users' collection (json), params.landlordId => searches the object with this particular ID
      const docRef = doc(db, 'users', params.landlordId)
      // get snapshot
      const docSnap = await getDoc(docRef)

      // See if that object with params.landlordId exists, if it does then transfer the fetched data to the Landlord object state
      if(docSnap.exists()) {
        setLandlord(docSnap.data())
      } else {
        // if it does not exist (in cases where a listing has been posted by a deleted landlord user)
        toast.error('Could not get landlord data')
      }
    }

    // call the function
    getLandlord()
  }, [params.landlordId])


  // Define function onChange for input field
  function onChange(e) {
    setMessage(e.target.value) // set the message state value to the input field value
  }



  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>

      {/* Make sure that landlord exists */}
      {/* If landlord data exists, then show the contact form */}
      {landlord !== null && (
        <main>
          {/* landlord name */}
          <div className="contactLandlord">
            {/* question mark makes sure you don't get any error in events where landlord is null */}
            <p className="landlordName">Contact {landlord?.name}</p>
          </div>

          {/* Email landlord Form */}
          <form className='messageForm'>
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">Message</label>
              {/* value={message} is the message state */}
              <textarea name="message" id="message" className='textarea' value={message} onChange={onChange}></textarea>
            </div>

            {/* Email functionality */}
            {/* ?Subject=${searchParams.get('listingName')    => this ${searchParams.get('listingName') GETS THE VALUE OF URL PARAM = listingName */}
            <a href={`mailto:${landlord.email}?Subject=${searchParams.get('listingName')}&body=${message}`}>
              {/* button within anchor tag */}
              <button type='button' className="primaryButton">Send Message</button>
            </a>
          </form>
        </main>
      )}
    </div>
  )
}

export default Contact