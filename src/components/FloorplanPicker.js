import React, { useState, useRef } from 'react';

const FLOORPLAN_URL = 'https://i.imgur.com/aOvnTYA.png';

const ZONES = [
  {
    id: 'bathroom',
    label: 'Bathroom',
    x: 2, y: 2, w: 20, h: 28,
    spots: ['Toilet', 'Sink / faucet', 'Shower / tub', 'Exhaust fan', 'Mirror / cabinet', 'Floor / grout']
  },
  {
    id: 'laundry',
    label: 'Laundry',
    x: 22, y: 2, w: 18, h: 22,
    spots: ['Washer', 'Dryer', 'Outlet / switch', 'Floor / drain']
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    x: 38, y: 2, w: 28, h: 35,
    spots: ['Sink / faucet', 'Refrigerator', 'Stove / oven', 'Dishwasher', 'Cabinet / drawer', 'Outlet / switch', 'Ceiling / light']
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    x: 2, y: 28, w: 38, h: 42,
    spots: ['Ceiling / light fixture', 'Window / blinds', 'Closet', 'Outlet / switch', 'Wall / door', 'Floor / carpet', 'A/C vent']
  },
  {
    id: 'living',
    label: 'Living Room',
    x: 55, y: 22, w: 43, h: 48,
    spots: ['A/C unit / thermostat', 'Ceiling / light fixture', 'Window / blinds', 'Outlet / switch', 'Wall / door', 'Floor / carpet', 'Smoke / CO detector']
  },
  {
    id: 'dining',
    label: 'Dining Area',
    x: 38, y: 35, w: 22, h: 30,
    spots: ['Ceiling / light fixture', 'Outlet / switch', 'Floor / carpet', 'Wall / door']
  },
  {
    id: 'patio',
    label: 'Patio',
    x: 62, y: 72, w: 36, h: 26,
    spots: ['Sliding door / lock', 'Ceiling / light', 'Outlet / switch', 'Floor / surface']
  }
];

function FloorplanPicker({ onSelect, onSkip }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [pinPos, setPinPos] = useState(null);
  const wrapRef = useRef(null);

  const handleZoneClick = (zone, e) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const el = e.currentTarget.getBoundingClientRect();
    const cx = ((el.left + el.width / 2 - rect.left) / rect.width) * 100;
    const cy = ((el.top + el.height * 0.35 - rect.top) / rect.height) * 100;
    setSelectedZone(zone);
    setSelectedSpot(null);
    setPinPos({ x: cx, y: cy });
  };

  const handleConfirm = () => {
    if (!selectedZone || !selectedSpot) return;
    onSelect({
      location_room: selectedZone.label,
      location_spot: selectedSpot,
      location_pin_x: pinPos.x,
      location_pin_y: pinPos.y
    });
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
        Tap the room where the issue is located
      </p>

      {/* Floorplan */}
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          background: '#f5f3ee',
          cursor: 'crosshair'
        }}
      >
        <img
          src={FLOORPLAN_URL}
          alt="Unit floorplan"
          style={{ width: '100%', display: 'block', opacity: 0.92 }}
        />

        {/* Zone overlays */}
        {ZONES.map(zone => (
          <div
            key={zone.id}
            onClick={(e) => handleZoneClick(zone, e)}
            style={{
              position: 'absolute',
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.w}%`,
              height: `${zone.h}%`,
              borderRadius: '6px',
              cursor: 'pointer',
              background: selectedZone?.id === zone.id
                ? 'rgba(20, 184, 166, 0.28)'
                : 'rgba(20, 184, 166, 0)',
              outline: selectedZone?.id === zone.id
                ? '2px solid #14B8A6'
                : 'none',
              transition: 'background 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => {
              if (selectedZone?.id !== zone.id && window.matchMedia('(hover: hover)').matches)
                e.currentTarget.style.background = 'rgba(20,184,166,0.14)';
            }}
            onMouseLeave={e => {
              if (selectedZone?.id !== zone.id && window.matchMedia('(hover: hover)').matches)
                e.currentTarget.style.background = 'rgba(20,184,166,0)';
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#0F6E56',
              background: 'rgba(225,245,238,0.92)',
              padding: '2px 7px',
              borderRadius: '4px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}>
              {zone.label}
            </span>
          </div>
        ))}

        {/* Drop pin */}
        {pinPos && (
          <div style={{
            position: 'absolute',
            left: `${pinPos.x}%`,
            top: `${pinPos.y}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50% 50% 50% 0',
              background: '#14B8A6',
              border: '2.5px solid white',
              transform: 'rotate(-45deg)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
            }} />
            <div style={{
              background: '#1B3A6B',
              color: 'white',
              fontSize: '10px',
              fontWeight: '600',
              padding: '3px 8px',
              borderRadius: '4px',
              marginTop: '4px',
              whiteSpace: 'nowrap'
            }}>
              {selectedSpot || selectedZone?.label}
            </div>
          </div>
        )}
      </div>

      {/* Spot picker */}
      {selectedZone && (
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
            Specific spot in <strong>{selectedZone.label}</strong>:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            {selectedZone.spots.map(spot => (
              <button
                key={spot}
                onClick={() => setSelectedSpot(spot)}
                style={{
                  background: selectedSpot === spot ? '#E1F5EE' : '#f8fafc',
                  border: selectedSpot === spot ? '1.5px solid #14B8A6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '13px 12px',
                  fontSize: '13px',
                  color: selectedSpot === spot ? '#0F6E56' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: selectedSpot === spot ? '600' : '400',
                  minHeight: '48px',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {spot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          onClick={handleConfirm}
          disabled={!selectedZone || !selectedSpot}
          style={{
            flex: 1,
            background: selectedZone && selectedSpot ? '#1B3A6B' : '#e2e8f0',
            color: selectedZone && selectedSpot ? 'white' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: selectedZone && selectedSpot ? 'pointer' : 'default'
          }}
        >
          Confirm Location
        </button>
        <button
          onClick={onSkip}
          style={{
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default FloorplanPicker;