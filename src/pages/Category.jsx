import {useEffect, useState} from 'react' // useEffect is for making the first call to get our listings from firebase
import {useParams} from 'react-router-dom' // useParams => to know if it is /category/rent  OR /category/sell (we must get the :categoryName => /sell or /rent)
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'     // SQL query, where, orderBy  || startAfter => for pagination 
import {db} from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
// import listingItem component
import ListingItem from '../components/ListingItem'

function Category() {
  // Set state variables
  const [listings, setListings] = useState(null) //by default null => this state is where you will place the fetched data
  const [loading, setLoading] = useState(true)
  // pagination
  const [lastFetchedListing, setLastFetchedListing] = useState(null)
  
  const params = useParams() // for getting the URL params

  useEffect(()=>{
    const fetchListings = async () => {
      try {
        // Get reference to the collection
        const listingsRef = collection(db, 'listings')

        // create a query
        const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), limit(10))

        // Execute the query
        const querySnap = await getDocs(q)

        // Pagination => get last fetched visible (last index => explains the minus 1 -1)
        const lastVisible = querySnap.docs[querySnap.docs.length -1]
        setLastFetchedListing(lastVisible) //gets the last entry

        // We must loop through the data to get it
        const listings = []

        querySnap.forEach((doc)=>{
          // use doc.data to get the actual listings object!
          return listings.push({
            id: doc.id,  // this gives an ID to the individual listing items
            data: doc.data()
          })
        })

        setListings(listings)
        setLoading(false) //loading shall be done by the time data is fetched
      } catch (error) {
        toast.error('Could not fetch listings')
      }
    }
    fetchListings()
  }, [params.categoryName])

  // Pagination / Load More function
  const onFetchMoreListings = async () => {
    try {
      // Get reference to the collection
      const listingsRef = collection(db, 'listings')

      // create a query => with StartAfter
      const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), startAfter(lastFetchedListing), limit(10))

      // Execute the query
      const querySnap = await getDocs(q)

      // Pagination => get last fetched visible (last index => explains the minus 1 -1)
      const lastVisible = querySnap.docs[querySnap.docs.length -1]
      setLastFetchedListing(lastVisible) //gets the last entry

      // We must loop through the data to get it
      const listings = []

      querySnap.forEach((doc)=>{
        // use doc.data to get the actual listings object!
        return listings.push({
          id: doc.id,  // this gives an ID to the individual listing items
          data: doc.data()
        })
      })

      // prevState => the first 10 you queried / fetched

      // spread across the previous data, then add the plus (10) more pages fetched (gathered from listings[] array)
      setListings((prevState)=>[...prevState, ...listings])
      setLoading(false) //loading shall be done by the time data is fetched
    } catch (error) {
      toast.error('Could not fetch listings')
    }
  }


  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {/* the header text depends whether you are in /category/rent or /category/sell */}
          {params.categoryName === 'rent' ? 'Places for rent' : 'Places for sale'}
        </p>
      </header>

      {/* This is basically an if() else if() else {} statement */}
      {/* If state loading is true then present the <Spinner /> component */}
      {/* else if listings array is not empty then show <></> */}
      {/* else say that there are no listings yet (since if else if statement is false then automatically there are no listings yet since listings.length is not > 0) */}
      {loading ? <Spinner /> : listings && listings.length > 0 ?
      // else if
       <>
        <main>
          <ul className="categoryListings">
            {/* loop through each listing items / entries */}
            {/* Make sure your map() arrow function is () => () and NOT () => {} for it to work */}
            {listings.map((listingItem)=>(
              // listingItem.data => returns the entire listing item object
              <ListingItem listing={listingItem.data} id={listingItem.id} key={listingItem.id} />
            ))}
          </ul>
        </main>

        {/* load more button */}
        <br />
        <br />
        {/* Check if there is content for the state => lastFetchedListing, if there is then show the button 'load more'  */}
        {lastFetchedListing && (
          <p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
        )}
       </> 
      
      //  else
       : <p>No listings for {params.categoryName}</p>}
    </div>
  )
}

export default Category