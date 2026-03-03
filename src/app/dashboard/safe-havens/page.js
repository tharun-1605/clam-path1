'use client';

const allHavens = [
    { id: 1, name: "Riverside Park", type: "Park", distance: "0.2 mi", rating: 4.8, score: 9.2, features: ["Benches", "Shade", "Nature"], lat: 40.8003, lng: -73.9716 },
    { id: 2, name: "Central Library", type: "Library", distance: "0.5 mi", rating: 4.9, score: 8.8, features: ["Quiet Zones", "WiFi", "AC"], lat: 40.6728, lng: -73.9683 },
    { id: 3, name: "Serenity Cafe", type: "Cafe", distance: "0.6 mi", rating: 4.5, score: 7.9, features: ["Low Music", "Cozy Seating"], lat: 40.8256, lng: -73.9497 },
    { id: 4, name: "City Museum", type: "Museum", distance: "1.2 mi", rating: 4.7, score: 8.5, features: ["Quiet Halls", "Visual Art"], lat: 40.7925, lng: -73.9519 },
];

export default function SafeHavensPage() {
    const handleNavigate = (haven) => {
        if (haven.lat && haven.lng) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${haven.lat},${haven.lng}`;
            window.open(url, '_blank');
        } else {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(haven.name)}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="container-max" style={{ padding: '40px 20px' }}>
            <h1 className="text-gradient" style={{ marginBottom: '30px' }}>Safe Havens Directory</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {allHavens.map(haven => (
                    <div key={haven.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ background: 'rgba(78, 205, 196, 0.1)', color: 'var(--primary-teal-dark)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                                {haven.type}
                            </span>
                            <span style={{ fontWeight: 700 }}>{haven.distance}</span>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '5px' }}>{haven.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ color: '#ECC94B' }}>★ {haven.rating}</span>
                            <span style={{ color: 'var(--neutral-text-light)' }}>• Calm Score: {haven.score}/10</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {haven.features.map(f => (
                                <span key={f} style={{ fontSize: '0.8rem', background: 'var(--neutral-bg)', padding: '4px 8px', borderRadius: '4px' }}>
                                    {f}
                                </span>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button className="btn-secondary" style={{ width: '100%' }}>Details</button>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => handleNavigate(haven)}
                            >
                                Navigate
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
