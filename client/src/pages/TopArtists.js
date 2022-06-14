import { useState, useEffect } from 'react';
import { catchErrors } from '../utils';
import { getTopArtists } from '../spotify';
import { ArtistsGrid, Loader, SectionWrapper, TimeRangeButtons } from '../components';
const TopArtists = () => {
    const [topArtists, setTopArtists] = useState(null);
    const [activeRange, setActiveRange] = useState('long');

    useEffect(() => {
        const fetchData = async () => {
            const userTopArtist = await getTopArtists(`${activeRange}_term`);
            setTopArtists(userTopArtist.data)
        }
        catchErrors(fetchData());
    }, [activeRange])
    // console.log(topArtists);
    return (
        
        <main>
            
            {topArtists ? (
                <SectionWrapper title='Top Artists' breadcrumb='true'>
                    <TimeRangeButtons setActiveRange={setActiveRange} activeRange={activeRange}/>
                    <ArtistsGrid artists={topArtists.items.slice(0,10)} />
                </SectionWrapper>
            ) : <Loader/>}

        </main>
    )
}
export default TopArtists;