import {useState, useEffect, useRef } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'
// for uploading images to firebase Storage
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import db to be used for the reference part
import {db} from '../firebase.config'
// import uuid for the unique image names
import {v4 as uuidv4} from 'uuid'

// import from firestore to be able to submit data (update data) to cloud firestore database
// update
// getDoc => for fetching the selected listing (pre-fill the input fields)
import {doc, updateDoc, getDoc, serverTimestamp} from 'firebase/firestore'
// useParams => for updating (getting the ID in url to fetch the data of the selected listing)
import {useNavigate, useParams} from 'react-router-dom'

function EditListing() {
// eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(false)   // this state determines which form you will have whether a form with geolocation input field or none

  const [loading, setLoading] = useState(false)
  const isMounted = useRef(true)
  // listing to be edited => UPDATE
  const [listing, setListing] = useState(null)

  const [formData, setFormData] = useState({
    type: 'rent', // by default => rent
    name: '',
    bedrooms: 1, // default = 1
    bathrooms: 1 ,// default = 1
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0
  })

  const {type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice,discountedPrice, images, latitude, longitude} = formData

  // initialize auth to get logged in user's data
  const auth = getAuth()
  const navigate = useNavigate()
  // for updating
  const params = useParams()

  // useEffect for updating the listing ////////////////
  useEffect(()=>{
    setLoading(true)
    
    async function fetchListing() {
      // reference doc
      const docRef = doc(db, 'listings', params.listingId) // listingId came from the param var name in URL back in App.js
      // get result / snap
      const docSnap = await getDoc(docRef)
      // check if there is data existing within docSnap 
      if(docSnap.exists()){
        // if there is a match then place the gathered data to 'listing' state => because we will use this state to pre-fill the input fields
        setListing(docSnap.data())
        // update the state=> formData to fill in the forms with the docSnap data fetched
        setFormData({
          ...docSnap.data(),
          address: docSnap.data().location // we did this since if we delete this => address field will be empty because instead of property name 'address', within our docSnap / db => it is called 'location'
        })
        setLoading(false)
      } else {
        // if there is no match
        navigate('/')
        toast.error('Listing does not exist')
      }
    }

    // call function
    fetchListing()
  }, [params.listingId, navigate]) // we sent these as dependency to get no warning in console


  // useEffect for redirecting user to somewhere else in cases where the listing does not belong to them
  // redirect if the listing is not user's
  useEffect(()=>{
    // check if the userRef (id of the listing) is not equal to the currentUser's uid (logged in user)
    // if it does not match then it does not belong to them (listing)
    // to know if the listing is yours => the userRef (listing ID) must be THE SAME with auth.currentUser.uid
    if(listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit this listing')
      navigate('/') // navigate back to home page
    }
  })


  // usEffect for checking logged in user => sets userRef to logged in user ///////////
  useEffect(()=>{
    if (isMounted) {

    // call onAuthStateChanged
    // this part checks if there is a user logged in and if there is then we must add a property to formData state called => userRef with a value of user.uid (from authentication of firebase)
    onAuthStateChanged(auth, (user) => {
      if(user) {
        setFormData({
          ...formData, userRef:user.uid
        })
      } else {
        navigate('/sign-in')
      }
    })
  }

  return () => {
    isMounted.current = false
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [isMounted])

  // check if page is loading
  if(loading) {
    return <Spinner />
  }

  // function onSubmit
  async function onSubmit(e) {
    e.preventDefault()

    // loading
    setLoading(true)
    
    // First check if discountedPrice is greater or equal to the regular price
    if(discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error('Discounted price needs to be less than regular price')
      return
    }

    // Make sure user cannot upload more than 6 images
    if(images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    // geolocation part
    let geolocation = {}
    let location  // just initialize the variable => location

    // check if you will be using the geolocation API or just the manual field inputs
    if(geolocationEnabled) {
      // This version of the app does not use the geolocation

    } else {
      // If it is not enabled, just take the lat and long value from the form and assign it to the object => geolocation
      geolocation.lat = latitude
      geolocation.lng = longitude
      location = address
      
    }

    // IMAGE PART
    // Store image in firebase Storage
    // Logic => for multiple image uploads, since it is placed within an array, you must loop through it and individually upload it to firebase Storage one by one

    const storeImage = async (imageItem) => {
      // we must return a new promise
      // if we complete a promise, we call resolve
      // if we get an error, we call reject
      return new Promise((resolve, reject)=>{
        // initialize storage
        const storage = getStorage()
        // assign unique filename
        const fileName = `${auth.currentUser.uid}-${imageItem.name}-${uuidv4()}`

        // Create Storage reference
        // params => storage, then put the path within the firebase storage => images/   the generated file name
        const storageRef = ref(storage, 'images/' + fileName)

        // create an upload task
        const uploadTask = uploadBytesResumable(storageRef, imageItem);

        // Copied from documentation https://firebase.google.com/docs/storage/web/upload-files => Monitor Upload Progress part
        uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        }, 
        (error) => {
          // Handle unsuccessful uploads
          reject(error)
        }, 
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL); // resolve promise
          });
        }
      );
      })
    }

    // Call the function (storeImage) for ALL the images
    // use promise.ALL to be able to resolve all the images uploaded
    const imgUrls = await Promise.all(
      // if promise resolves, then all the uploaded images will be placed on const imgUrls (an Array of image urls)
      [...images].map((imageItem)=> storeImage(imageItem))
    ).catch(()=>{
      // If promise rejetcs
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    // Create object to submit to the database
    const formDataCopy = {
      ...formData, // get all the data from formFata state
      imgUrls,
      geolocation,
      timestamp: serverTimestamp() // adds the tiemstamp upon save
    }

    // cleanup data from formDataCopy (not the real state), get rid of 'images' property since we already have imgUrls
    // get rid of formDataCopy.address as well since that it already set as location on the geolocation part
    // take note that you must only delete properties from 'formDataCopy' and not the exact 'formData' state
    delete formDataCopy.images
    delete formDataCopy.address
    // add the 'location' variable from geolocation part as a property to formDataCopy
    // formDataCopy.location = address
    location && (formDataCopy.location = location)

    // Check if there is an offer or none, if there is no offer then delete the discountedPrice from the object
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    // Save the formDataCopy object to database
    // create reference
    // UPDATE THE DOCUMENT
    const docRef = doc(db, 'listings', params.listingId)
    await updateDoc(docRef, formDataCopy) // updateDoc takes two params => the reference (which listing), then the data you want to update it with
    console.log(`this is docRef ${docRef}`);
    setLoading(false)

    // once loading is complete and data has been added to firestore cloud database, show notification success
    toast.success('Listing saved')
    // redirect to the listing you just posted / created
    // ${formDataCopy.type} => either 'rent' or 'sale'
    // ${docRef.id} => listing ID
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)


  }

  // function onMutate
  function onMutate(e) {
    e.preventDefault()

    let boolean = null  // for transforming input values from string to bool type

    // e.target.value => a button click / keyboard typing / submit event
    // converting string to boolean
    if(e.target.value === 'true') {
      boolean = true
    }

    if(e.target.value === 'false') {
      boolean = false
    }

    // check if it is a file upload or not

    // Files
    // e.target.files = > array of files we choose
    if(e.target.files) {
      // If there is a file upload, then put it on formData state
      // prevstate allows you to get the formData properties
      // You spread it out ...prevState to get all values (previous values) then you update the 'images' property with the uploaded e.target.files
      setFormData((prevState)=> ({
        ...prevState,
        images: e.target.files
      }))
    }

    // If it is not a file upload
    // Text / Booleans / Numbers
    if(!e.target.files) {
      setFormData((prevState)=>({
        ...prevState,
        // double question mark means => if the value on its left is null then do this (on the right)
        // the boolean var being null means its not a button click but an input field text or number
        // you must be able to distinguish whether the tag who called onMutate is a button , an input field, or a file upload
        // buttons are boolean values , files are file value, and input fields are text / number values
        [e.target.id]: boolean ?? e.target.value ,
      }))
    }


  }

  return (
    <div className='profile'>
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>

    {/* Form */}
    {/* Note: ID attr value of each button and input field shall be the same name as the property name in formData state */}
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          {/* buttons */}
          <div className="formButtons">
            {/* conditional button, if the type is for sale then button class is 'formButtonActive */}
          <button type='button' className={type === 'sale' ? 'formButtonActive' : 'formButton'} id='type' value='sale' onClick={onMutate}>
            Sell
          </button>

          <button type='button' className={type === 'rent' ? 'formButtonActive' : 'formButton'} id='type' value='rent' onClick={onMutate}>
            Rent
          </button>
          </div>

          {/* name input field */}
          <label className='formLabel'>Name</label>
          <input className='formInputName' type='text' id='name' value={name} onChange={onMutate} maxLength='32' minLength='10' required />

          <div className="formRooms flex">
            {/* Bedrooms */}
            <div>
              <label className="formLabel">Bedrooms</label>
              <input type="number" id='bedrooms' value={bedrooms} onChange={onMutate} min='1' max='50' required className="formInputSmall" />
            </div>
            {/* Bathrooms */}
            <div>
              <label className="formLabel">Bathrooms</label>
              <input type="number" id='bathrooms' value={bathrooms} onChange={onMutate} min='1' max='50' required className="formInputSmall" />
            </div>
          </div>

          {/* Parking */}
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            {/* YES button */}
            <button className={parking ? 'formButtonActive' : 'formButton'}
            type='button' id='parking' value={true} onClick={onMutate} min='1' max='50'
            >Yes</button>
            {/* NO button */}
            <button className={!parking && parking !==null ? 'formButtonActive' : 'formButton'}
            type='button' id='parking' value={false} onClick={onMutate}
            >No</button>
          </div>

          {/* Furnished */}
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            {/* YES button */}
            <button className={furnished ? 'formButtonActive' : 'formButton'}
            type='button' id='furnished' value={true} onClick={onMutate} min='1' max='50'
            >Yes</button>
            {/* NO button */}
            <button className={!furnished && furnished !==null ? 'formButtonActive' : 'formButton'}
            type='button' id='furnished' value={false} onClick={onMutate}
            >No</button>
          </div>

          {/* Address text area */}
          <label className='formLabel'>Address</label>
          <textarea className='formInputAddress' type='text' id='address' value={address} onChange={onMutate} required></textarea>

          {/* Geoloxation input field conditional => will only appear when your geolocation state is true */}
          {/* If your state => gelocationEnabled is false, then show input field for long and lat */}
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input type="number" id='latitude' value={latitude} onChange={onMutate} className="formInputSmall" required />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input type="number" id='longitude' value={longitude} onChange={onMutate} className="formInputSmall" required />
              </div>
            </div>
          )}

          {/* Offers */}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            {/* YES button */}
            <button className={offer ? 'formButtonActive' : 'formButton'}
            type='button' id='offer' value={true} onClick={onMutate} min='1' max='50'
            >Yes</button>
            {/* NO button */}
            <button className={!offer && offer !==null ? 'formButtonActive' : 'formButton'}
            type='button' id='offer' value={false} onClick={onMutate}
            >No</button>
          </div>

          {/* Regular Price */}
          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input type="number" id='regularPrice' value={regularPrice} onChange={onMutate} min='50' max='750000000' className="formInputSmall" required />

            {/* Add a conditional to determine whether to add the text => / month or not since this only applies to rent types */}
            {type === 'rent' && (
              <p className="formPriceText">$ / Month</p>
            )}
          </div>

          {/* Discounted Price => will only appear if offer='true' */}
          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input type="number" id='discountedPrice' value={discountedPrice} onChange={onMutate} min='50' max='750000000' className="formInputSmall" required={offer} />
            </>
          )}

          {/* Image Upload */}
          <label className="formLabel">Images</label>
          <p className="imagesInfo">The first image will be the cover (max 6).</p>
          <input className="formInputFile" type="file" id='images' onChange={onMutate} max='6' accept='.jpg,.png,.jpeg' multiple required />

          {/* Submit button */}
          <button className="primaryButton createListingButton" type='submit'>Edit Listing</button>

        </form>
      </main>
    </div>
  )
}

export default EditListing