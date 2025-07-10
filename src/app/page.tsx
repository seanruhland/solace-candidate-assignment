"use client";

import { useEffect, useState, useMemo } from "react";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: string;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvocates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/advocates");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
      } catch (err) {
        console.error("Error fetching advocates:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch advocates");
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchAdvocates();
  }, []);
  //TODO: Move this search to the server side
  const filteredAdvocates = useMemo(() => {
    if (!searchTerm.trim()) return advocates;

    const searchLower = searchTerm.toLowerCase();
    return advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(searchLower) ||
        advocate.lastName.toLowerCase().includes(searchLower) ||
        advocate.city.toLowerCase().includes(searchLower) ||
        advocate.degree.toLowerCase().includes(searchLower) ||
        advocate.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchLower)
        ) ||
        advocate.yearsOfExperience.toString().includes(searchTerm)
      );
    });
  }, [advocates, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  //TODO: Move to separate files and utilize and component library for loading and error states
  // Loading state
  if (isLoading) {
    return (
      <main className="m-6">
        <div>Loading advocates...</div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="m-6">
        <div>
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="m-6">
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
        </p>
        <input
          className="border border-black"
          onChange={handleSearchChange}
          value={searchTerm}
          placeholder="Search advocates..."
          name="search"
        />
        <button onClick={handleResetSearch}>Reset Search</button>
      </div>
      <br />
      <br />
      <div>
        <p>Showing {filteredAdvocates ? filteredAdvocates.length : advocates.length} of {advocates.length} advocates</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => (
            <tr key={advocate.id}>
              <td>{advocate.firstName}</td>
              <td>{advocate.lastName}</td>
              <td>{advocate.city}</td>
              <td>{advocate.degree}</td>
              <td>
                {advocate.specialties.map((specialty, index) => (
                  <div key={`${advocate.id}-${index}`}>{specialty}</div>
                ))}
              </td>
              <td>{advocate.yearsOfExperience}</td>
              <td>{advocate.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}