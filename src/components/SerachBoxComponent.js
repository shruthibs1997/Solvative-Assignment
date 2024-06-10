import {useState, useEffect,useRef} from "react";
import styled from 'styled-components';
import axios from "axios";

const SearchBoxComponent =()=>{
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
      const handleShortcut = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
          e.preventDefault();
          inputRef.current.focus();
        }
      };
  
      window.addEventListener('keydown', handleShortcut);
      return () => {
        window.removeEventListener('keydown', handleShortcut);
      };
  }, [])


  const handleSearch = (e) => {
    e.preventDefault();
    console.log("handle search enter")
    fetchResults(query, page, resultsPerPage);
  };

  const fetchResults = async(query, page, limit) => {
    setLoading(true);
    const options = {
      method: 'GET',
      url: process.env.REACT_APP_API_URL,
      params: {
        countryIds: 'IN',
        namePrefix: query,
        limit: limit,
        offset: (page - 1) * limit,
      },
      headers: {
        'x-rapidapi-host': process.env.REACT_APP_RAPIDAPI_HOST,
        'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
      },
    };
    console.log("enter fetch function",options)
    try {
      const response = await axios.request(options);
      // const res = await response.data;
      // setResults(response.data.data);
      // setTotalResults(response.data.metadata.totalCount);
      setLoading(false);
      console.log("response",response)
    } catch (error) {
      console.log("response")
      console.error(error);
      setLoading(false);
    }
  };

  const handleResultsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 10) {
      setResultsPerPage(value);
      setPage(1);
      // fetchResults(query, 1, value);
    } else {
      alert('Please enter a number between 1 and 10');
    }
  };

  return(
    <div>
      <form onSubmit={handleSearch}>
        <SearchContainer>
          <SearchBox
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputRef}
            placeholder="Search..."
          />
          <ShortcutBox>Ctrl + /</ShortcutBox>
        </SearchContainer>
      </form>
      {loading ? (
        <Spinner />
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader>#</TableHeader>
              <TableHeader>Place Name</TableHeader>
              <TableHeader>Country</TableHeader>
            </tr>
          </thead>
          <tbody>
            {(results.length === 0 && query) ? (
              <tr>
                <TableCell colSpan="3">
                  {'No result found'}
                </TableCell>
              </tr>
            ) : (
              results.map((result, index) => (
                <tr key={index}>
                  <TableCell>{(page - 1) * resultsPerPage + index + 1}</TableCell>
                  <TableCell>{result.city}</TableCell>
                  <TableCell>
                    <img
                      src={`https://flagsapi.com/${result.countryCode}/shiny/16.png`}
                      alt={result.country}
                    />{' '}
                    {result.country}
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
      <PaginationContainer>
        <div>
          <PaginationButton
            onClick={() => {
              setPage(page - 1);
              fetchResults(query, page - 1, resultsPerPage);
            }}
            disabled={page === 1}
          >
            Previous
          </PaginationButton>
          <PaginationButton
            onClick={() => {
              setPage(page + 1);
              fetchResults(query, page + 1, resultsPerPage);
            }}
            disabled={page * resultsPerPage >= totalResults}
          >
            Next
          </PaginationButton>
        </div>
        <div>
          Results per page:
          <ResultsPerPageInput
            type="number"
            value={resultsPerPage}
            onChange={handleResultsPerPageChange}
            min="1"
            max="10"
          />
        </div>
      </PaginationContainer>
    </div>
  )
}

export default SearchBoxComponent;




const SearchContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const SearchBox = styled.input`
  width: 241px;
  height: 38px;
  font-size: 16px;
  background-color: rgb(255, 255, 255);
  border-color: rgb(206, 212, 218);
  padding: 6px 12px 6px 12px;
  padding-right: 80px; 
  border-radius: 4px;
  outline: none;
  &:focus {
    border-color: #7952b3;
    box-shadow: 0 0 0 3px rgb(121 82 179 / 25%);
  }
  &:disabled {
    background-color: rgb(233, 236, 239);
  }
`;

const ShortcutBox = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  user-select: none;
  pointer-events: none; 
`;

const Spinner = styled.div`
  margin-top: 20px;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Table = styled.table`
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 8px;
  border: 1px solid rgb(222, 226, 230);
  font-weight: 700;
`;

const TableCell = styled.td`
  padding: 8px;
  border: 1px solid rgb(222, 226, 230);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  margin: 0 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  &:disabled {
    background-color: #eee;
    cursor: not-allowed;
  }
`;

const ResultsPerPageInput = styled.input`
  width: 50px;
  padding: 4px;
  margin-left: 10px;
`;
