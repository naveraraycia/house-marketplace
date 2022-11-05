import {useState, useEffect} from 'react'
// useParams => used to get URL param value
import {Link, useNavigate, useParams} from 'react-router-dom'
// getDoc && doc => for fetching data from collection
import {getDoc, doc} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {db} from '../firebase.config'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
// import stuff from react-leaflet
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
// Import swiper
import SwiperCore, {Navigation, Pagination, Scrollbar, A11y} from 'swiper'
import {Swiper, SwiperSlide} from 'swiper/react'
// import swiper css
import 'swiper/css'
// For the slide indicators
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';


function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)

  const navigate = useNavigate()
  const params = useParams()

  // initialize Auth
  const auth = getAuth()

  // Fetching of Listings go within useEffect()
  useEffect(()=>{
    const fetchListing = async () => {
      // create reference to document database => this gets the object / data for the specific listing with params.listingId
      const docRef = doc(db,'listings', params.listingId)
      // get snapshot from the reference
      const docSnap = await getDoc(docRef)

      // check if the data exist (if there is a listing with params.listingId)
      if(docSnap.exists()) {
        // If there is an existing listing for that ID => transfer the fetched data to 'listing' state
        console.log(docSnap.data())
        setListing(docSnap.data())
        // set loading to false
        setLoading(false)
      }
    }

    // call fetch function
    fetchListing()
  }, [navigate, params.listingId]) // you must put [navigate, params.listingId] in order to avoid a 'warning' in console

  // Spinner part check if loading
  if(loading) {
    return <Spinner />
  }


  return (
    <main>
      {/* SLIDER PART */}
      <Swiper modules={[Navigation, Pagination, Scrollbar, A11y]} slidesPerView={1} pagination={{clickable: true}} navigation style={{ height: '300px' }}>
          {/* loop through your imgUrls and output a swiper slide component for each index */}
          {listing.imgUrls.map((urlItem, index)=>{
           return ( <SwiperSlide key={index}>
              <div style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: 'cover'}} 
                className="swiperSlideDiv"></div>
            </SwiperSlide>
           )
          })}
      </Swiper>

      {/* SHARE ICON => copies link to clipboard */}
      <div className="shareIconDiv" onClick={()=>{
        // copy URL to clipbord
        navigator.clipboard.writeText(window.location.href)
        setShareLinkCopied(true) // set share state to true

        // wait two seconds before setting share state back to false
        // we do this in order to show the 'link copied!' message since the message only appears when this share state is true. To get rid of the message, we must remove it after 2 seconds by setting the state back to false
        setTimeout(()=>{
          setShareLinkCopied(false)
        }, 2000)
      }}>
        <img src={shareIcon} alt="" />
      </div>

      {/* Check if link has been copied to clipboard */}
      {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

      {/* Listing details */}
      <div className="listingDetails">
        {/* show listing name + price. If there is an offer then show discounted Price, if no offer => show regular price */}
        {/* $ is literally money sign and not for var declaration like in jQuery */}
        {/* .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') */}
        {/* block of code above is a regular expression that formats the number from 2000 => 2,000 */}
        <p className="listingName">{listing.name} - ${listing.offer ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>

        <p className="listingLocation">{listing.location}</p>

        {/* For sale or for rent => listing Type */}
        <p className="listingType">
          For {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>

        {/* Show how much you are saving if there is an offer */}
        {listing.offer && (
          <p className='discountPrice'>
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        {/* Listing details */}
        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : `${listing.bedrooms} Bedroom` }
          </li>

          <li>
            {listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : `${listing.bathrooms} Bathroom` }
          </li>

          <li>
            {/* Check if parking === true */}
            {listing.parking && 'Parking Spot'}
          </li>

          <li>
            {/* Check if furnished === true */}
            {listing.furnished && 'Furnished'}
          </li>
        </ul>

          <p className="listingLocationTitle">Location</p>

          {/* MAP PART */}
          <div className="leafletContainer">
            <MapContainer style={{height: '100%', width: '100%'}} center={[listing.geolocation.lat, listing.geolocation.lng]} zoom={13} scrollWheelZoom={false}>

            {/* just copy and paste this part */}
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            {/* Pin icon position */}
            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              {/* Within <Marker> add a <Popup> tag => this appears when you click the pin icon on map */}
              <Popup>{listing.location}</Popup>
            </Marker>


            </MapContainer>
          </div>

          {/* Add a 'Contact' button ONLY IF IT IS NOT THE CURRENT USER'S LISTING (because you cant contact yourself for rent or sale lol*/}
          {/* The question mark beside auth.currentUser => makes sure we do not get an error saying 'user is null' */}

          {auth.currentUser?.uid !== listing.userRef && (
            <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} className='primaryButton'>Contact Landlord</Link>
          )}

      </div>

    </main>
  )
}

export default Listing

// Leaflet import fix
// https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat