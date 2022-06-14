import { useState, useEffect } from 'react';
import { catchErrors } from '../utils';
import { getTopTracks } from '../spotify';
import {  SectionWrapper, TimeRangeButtons, TrackList,Loader } from '../components';
const TopTracks = () => {
    const [topTracks, setTopTracks] = useState(null);
    const [activeRange, setActiveRange] = useState('long');

    useEffect(() => {
        const fetchData = async () => {
            const usetTopTracks = await getTopTracks(`${activeRange}_term`);
            setTopTracks(usetTopTracks.data)
        }
        catchErrors(fetchData());
    }, [activeRange])
    // console.log(topArtists);
    return (
        
        <main>
            
            {topTracks ? (
                <SectionWrapper title='Top Tracks' breadcrumb='true'>
                    <TimeRangeButtons setActiveRange={setActiveRange} activeRange={activeRange}/>
                    <TrackList tracks={topTracks.items} />
                </SectionWrapper>
            ) :
                <Loader />
            }

        </main>
    )
}

export default TopTracks;