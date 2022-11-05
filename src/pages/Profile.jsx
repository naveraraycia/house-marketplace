import {useState, useEffect} from 'react'
import {getAuth, updateProfile} from 'firebase/auth'
import {useNavigate, Link} from 'react-router-dom'
// Import from firestore to be able to update user data credentials
import {updateDoc, doc, collection, getDocs, query, where, orderBy, deleteDoc} from 'firebase/firestore'
// import db from firebase.config file
import {db} from '../firebase.config'
// import toast for toastify
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
// import listing item component (for the personal listings posted)
import ListingItem from '../components/ListingItem'

function Profile() {
  // Initialize Auth
  const auth = getAuth()

  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)
  const [changeDetails, setChangeDetails] = useState(false)  //false by default
  // User Credential State
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  }) 

  // De-sturcture the formData name and email property
  const {name, email} = formData

  // Initialize useNavigate => to be able to navigate back to the homepage
  const navigate = useNavigate()

  //  fetch user's own listings
  useEffect(()=>{
    // fetch the listings that match the userRef field with the logged in user

    async function fetchUserListings() {
      // get reference
      const listingsRef = collection(db, 'listings')
      // create query => 'SELECT * WHERE userRef == auth.currentUser.uid' ORDER BY timestamp DESC
      const q = query(listingsRef, where('userRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc'))
      // get query result / snap
      const querySnap = await getDocs(q)

      // put result individually within listings[]
      let listings = []

      querySnap.forEach((docItem)=>{
        return listings.push({
          // push an object
          id: docItem.id,
          data: docItem.data()
        })
      })

      // transfer listings[] content to 'listings' State
      setListings(listings)
      setLoading(false)
    }

    // call the function
    fetchUserListings()

  }, [auth.currentUser.uid])  // we placed this as dependency since we will be using this for useEffect (auth.currentUser.uid === logged in User)



  // onLogout function
  const onLogout = () => {
    auth.signOut()

    // navigate back to the homepage
    navigate('/')
  }

  // onSubmit function
  const onSubmit = async () => {
    try {
      // Check if the current user's display name is NOT equal to the actual name in the formData (IF IT IS NOT EQUAL IT MEANS IT HAS BEEN UPDATED)
      if(auth.currentUser.displayName !== name) {
        // Update display name in firebase
        // Await since updateProfile() returns a promise 
        // updateProfile() takes two params => current user then its property that we want to update (which is displayName) equal to what must it be updated with (name from formData [updated])
        await updateProfile(auth.currentUser, {
          displayName: name
        })

        // Update in firestore
        // to update a document, you must create a reference
        // doc() params => database name from firebase.config file, 'users' which is a collection name (table name), then the logged in user's UID
        const userRef = doc(db, 'users', auth.currentUser.uid)
        // updateDoc() params => userRef above, then the property you want to update and data you want to update it to (in this case you want the 'name' from the collection to be updated with the 'name' property from the formData state (updated name))
        await updateDoc(userRef, {
          name: name
        })
      }
    } catch (error) {
      toast.error('Could not update profile details')
    }
  }

  // onChange function
  const onChange = (e) => {
    // update formData state since by the time you call this function, it means you are in edit mdode
    // formData => user credentials on Firestore
    setFormData((prevState)=> ({
      ...prevState, // get the previous state content
      [e.target.id]: e.target.value  // update the property of the state that is similar to the selected input ID (either name or email) then set the value to whatever the user is typing (e.target.value)
    }))
  }

  // onDelete function
  async function onDelete(listingId) {
    // check first if u really want to delete
    if(window.confirm('Are you sure you want to delete?')) {
      // if yes then proceed to deleting entry on database
      await deleteDoc(doc(db, 'listings', listingId))
      // also delete entry on UI
      // filter () => only retains listings that are not equal to the listingId (since listingId is the deleted entry)
      const updatedListings = listings.filter((listingItem)=> listingItem.id !== listingId)
      // Update state 'listings' with the filtered version
      setListings(updatedListings)
      // success notif
      toast.success('Successfully deleted listing')
    }
  }

  // onEdit function
  function onEdit(listingId) {
    navigate(`/edit-listing/${listingId}`)
  }

  ////////////////////////////////////

  return <div className='profile'>
    <header className='profileHeader'>
      <p className="pageHeader">My Profile</p>
      <button type='button' onClick={onLogout} className="logOut">Logout</button>
    </header>

    <main>
      <div className="profileDetailsHeader">
        <p className="profileDetailsext">Personal Details</p>
        <p className="changePersonalDetails" onClick={()=> {
          changeDetails && onSubmit() // if changeDetails is true (on edit mode) then this onClick shall be an onSubmit() event instead
          setChangeDetails((prevState)=> !prevState) // after submitting, your changeDetails state shall be toggled (opposite)
        }}>
          {changeDetails ? 'done' : 'change'}
        </p>
      </div>

      <div className="profileCard">
        <form>
          {/* ClassName is conditional, checks if you are in edit mode or not */}
          {/* disabled ={!changeDetails} means your diabled attr will depend on your changeDetails state */}
          {/* value = {name} from your formData (state that holds logged in user credentials) */}
          <input type="text" className={!changeDetails ? 'profileName' : 'profileNameActive'} id="name" disabled={!changeDetails} value={name} onChange={onChange} />

          <input type="text" className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} id="email" disabled={!changeDetails} value={email} onChange={onChange} />
        </form>
      </div>

      <Link to='/create-listing' className='createListing'>
        <img src={homeIcon} alt="home" />
        <p>Sell or rent your home</p>
        <img src={arrowRight} alt='arrow right' />
      </Link>

      {/* YOUR LISTINGS */}
      {/* if state isn't loading anymore and there are listings fetched then output the fragment*/}
      {!loading && listings?.length > 0 && (
        <>
          <p className="listingText">Your Listings</p>
          <ul className="listingsList">
            {/* loop through all current user's listings here */}
            {listings.map((listingItem)=> (
              // output the listing item component
              <ListingItem key={listingItem.id} listing={listingItem.data} id={listingItem.id} onDelete={()=> onDelete(listingItem.id)} onEdit={()=> onEdit(listingItem.id)} />
            ))}
          </ul>
        </>
      )}
    </main>
  </div>
}

export default Profile