import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EmailTemp from '../Component/EmailTemplate';



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/emailtemplate" element={<EmailTemp />} />
           
            </Routes>
        </Router>
    );
}

export default App;