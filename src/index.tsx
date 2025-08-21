import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import StellantisPlatform from './StellantisPlatform.tsx';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <StellantisPlatform />
    </React.StrictMode>
);
