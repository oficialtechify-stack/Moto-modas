import { useState, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { 
  Compass, 
  Navigation, 
  MapPin, 
  Play, 
  Square, 
  Info, 
  AlertCircle, 
  ExternalLink,
  Car,
  Clock,
  Map as MapIcon,
  ChevronsRight,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Store Headquarters Coordinate (Curado III, Jaboatão)
const DESTINATION_COORD = { lat: -8.082729, lng: -34.977239 };
const STORE_ADDRESS = 'Av. Antonio Jacome Bezerra, N: 9 C, Curado III, Jaboatão';

// Pre-calculated route coordinates and turn-by-turn steps for simulating 100% robust Uber paths
// even if Google Maps key has quota errors or fails in preview sandbox.
interface RoutePreset {
  name: string;
  distance: string;
  duration: string;
  steps: {
    instruction: string;
    distance: string;
    icon: 'start' | 'left' | 'right' | 'straight' | 'arrive';
    coords: { lat: number; lng: number };
  }[];
  path: { lat: number; lng: number }[];
}

const ROUTE_PRESETS: { [key: string]: RoutePreset } = {
  'curado2': {
    name: 'Do Curado II',
    distance: '1,8 km',
    duration: '4 min',
    path: [
      { lat: -8.0772, lng: -34.9692 },
      { lat: -8.0785, lng: -34.9710 },
      { lat: -8.0801, lng: -34.9732 },
      { lat: -8.0815, lng: -34.9750 },
      { lat: -8.0822, lng: -34.9760 },
      { lat: -8.082729, lng: -34.977239 }
    ],
    steps: [
      { instruction: 'Siga na direção oeste na Av. Curado II', distance: '300m', icon: 'start', coords: { lat: -8.0772, lng: -34.9692 } },
      { instruction: 'Vire à esquerda na Rua Nove', distance: '500m', icon: 'left', coords: { lat: -8.0785, lng: -34.9710 } },
      { instruction: 'Siga em frente na Av. Dolores Duran', distance: '600m', icon: 'straight', coords: { lat: -8.0801, lng: -34.9732 } },
      { instruction: 'Vire à direita na Av. Antonio Jacome Bezerra', distance: '400m', icon: 'right', coords: { lat: -8.0822, lng: -34.9760 } },
      { instruction: 'Chegada na MotoModas (Nº 9 C) está à sua direita!', distance: 'Chegou', icon: 'arrive', coords: { lat: -8.082729, lng: -34.977239 } }
    ]
  },
  'recife_centro': {
    name: 'Do Centro do Recife (Via BR-232)',
    distance: '15,5 km',
    duration: '18 min',
    path: [
      { lat: -8.0631, lng: -34.8711 },
      { lat: -8.0682, lng: -34.8902 },
      { lat: -8.0699, lng: -34.9150 },
      { lat: -8.0735, lng: -34.9388 },
      { lat: -8.0805, lng: -34.9602 },
      { lat: -8.0811, lng: -34.9680 },
      { lat: -8.0816, lng: -34.9740 },
      { lat: -8.0825, lng: -34.9765 },
      { lat: -8.082729, lng: -34.977239 }
    ],
    steps: [
      { instruction: 'Parta do Marco Zero pegando a Av. Eng. Abdias de Carvalho', distance: '3,2 km', icon: 'start', coords: { lat: -8.0631, lng: -34.8711 } },
      { instruction: 'Continue para a Rodovia Governador Mário Covas (BR-101 S/N)', distance: '4,5 km', icon: 'straight', coords: { lat: -8.0699, lng: -34.9150 } },
      { instruction: 'Acesse a rampa de conversão para a BR-232 Oeste', distance: '5,1 km', icon: 'right', coords: { lat: -8.0735, lng: -34.9388 } },
      { instruction: 'Pegue a saída para Curado III / Jaboatão', distance: '1,8 km', icon: 'right', coords: { lat: -8.0811, lng: -34.9680 } },
      { instruction: 'Entre na Av. Dolores Duran e siga até o Curado III', distance: '700m', icon: 'straight', coords: { lat: -8.0816, lng: -34.9740 } },
      { instruction: 'Vire levemente à esquerda na Av. Antonio Jacome Bezerra', distance: '200m', icon: 'left', coords: { lat: -8.0825, lng: -34.9765 } },
      { instruction: 'Chegada na MotoModas à direita! (Av. Antonio Jacome Bezerra Nº 9 C)', distance: 'Chegou', icon: 'arrive', coords: { lat: -8.082729, lng: -34.977239 } }
    ]
  },
  'metro_coqueiral': {
    name: 'Do Metrô Coqueiral',
    distance: '3,2 km',
    duration: '7 min',
    path: [
      { lat: -8.0933, lng: -34.9572 },
      { lat: -8.0910, lng: -34.9601 },
      { lat: -8.0872, lng: -34.9650 },
      { lat: -8.0845, lng: -34.9712 },
      { lat: -8.0832, lng: -34.9751 },
      { lat: -8.082729, lng: -34.977239 }
    ],
    steps: [
      { instruction: 'Siga na direção norte na Rua de Coqueiral', distance: '400m', icon: 'start', coords: { lat: -8.0933, lng: -34.9572 } },
      { instruction: 'Vire à esquerda na Av. Leitão da Cunha', distance: '1,2 km', icon: 'left', coords: { lat: -8.0910, lng: -34.9601 } },
      { instruction: 'Vire à direita na Av. Rosa e Silva', distance: '900m', icon: 'right', coords: { lat: -8.0872, lng: -34.9650 } },
      { instruction: 'Na rotatória, pegue a saída para o Curado III', distance: '500m', icon: 'straight', coords: { lat: -8.0845, lng: -34.9712 } },
      { instruction: 'Vire à esquerda na Av. Antonio Jacome Bezerra', distance: '200m', icon: 'left', coords: { lat: -8.0832, lng: -34.9751 } },
      { instruction: 'Chegada na MotoModas está pronta para receber você!', distance: 'Chegou', icon: 'arrive', coords: { lat: -8.082729, lng: -34.977239 } }
    ]
  }
};

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MOCK_API_KEY';

export default function MapView() {
  const [selectedOrigin, setSelectedOrigin] = useState<keyof typeof ROUTE_PRESETS>('curado2');
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [carPosition, setCarPosition] = useState<{ lat: number; lng: number }>(DESTINATION_COORD);
  const [simRate, setSimRate] = useState(1); // 1x, 2x, 4x speed slider for demoing
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // Dynamic values calculated during simulator tick
  const [simDistanceLeft, setSimDistanceLeft] = useState<string>('0 km');
  const [simDurationLeft, setSimDurationLeft] = useState<string>('0 min');

  const routeData = ROUTE_PRESETS[selectedOrigin];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize car starting position depending on active path
  useEffect(() => {
    if (routeData?.path?.length > 0) {
      setCarPosition(routeData.path[0]);
      setSimDistanceLeft(routeData.distance);
      setSimDurationLeft(routeData.duration);
    }
    stopSimulation();
  }, [selectedOrigin]);

  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsNavigating(false);
    setCurrentStepIndex(0);
    if (routeData?.path?.length > 0) {
      setCarPosition(routeData.path[0]);
    }
  };

  const startSimulation = () => {
    stopSimulation();
    setIsNavigating(true);
    let step = 0;
    const pathPoints = routeData.path;
    const stepCount = pathPoints.length;

    timerRef.current = setInterval(() => {
      if (step >= stepCount) {
        clearInterval(timerRef.current!);
        setIsNavigating(false);
        setCurrentStepIndex(routeData.steps.length - 1);
        setCarPosition(DESTINATION_COORD);
        setSimDistanceLeft('0 m');
        setSimDurationLeft('Chegou!');
        return;
      }

      setCarPosition(pathPoints[step]);

      // Map progress ticks to the corresponding steps
      const progressFraction = step / (stepCount - 1);
      const targetStepIdx = Math.min(
        Math.floor(progressFraction * routeData.steps.length),
        routeData.steps.length - 1
      );
      setCurrentStepIndex(targetStepIdx);

      // Decrement simulated distance/duration values left
      const metersTotal = parseFloat(routeData.distance.replace(',', '.')) * 1000;
      const metersLeft = Math.round(metersTotal * (1 - progressFraction));
      const minTotal = parseInt(routeData.duration);
      const minLeft = Math.ceil(minTotal * (1 - progressFraction));

      setSimDistanceLeft(metersLeft > 1000 ? `${(metersLeft / 1000).toFixed(1)} km` : `${metersLeft} m`);
      setSimDurationLeft(minLeft > 0 ? `${minLeft} min` : 'Chegando...');

      step++;
    }, 2000 / simRate);
  };

  // User triggers custom GPS / location lookup
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError('Seu navegador não suporta geolocalização.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationError(null);
        // Add a temporary dynamic "Seu Local" route trigger
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        ROUTE_PRESETS['my_location'] = {
          name: 'Sua Localização GPS Atual',
          distance: '3.9 km',
          duration: '8 min',
          path: [
            { lat: userLat, lng: userLng },
            { lat: (userLat + DESTINATION_COORD.lat) / 2, lng: (userLng + DESTINATION_COORD.lng) / 2 },
            { lat: DESTINATION_COORD.lat + 0.001, lng: DESTINATION_COORD.lng - 0.001 },
            DESTINATION_COORD
          ],
          steps: [
            { instruction: 'Siga na direção da MotoModas pelo caminho otimizado', distance: '1,5 km', icon: 'start', coords: { lat: userLat, lng: userLng } },
            { instruction: 'Pegue o retorno para Avenida Antonio Jacome Bezerra', distance: '2,2 km', icon: 'straight', coords: { lat: (userLat + DESTINATION_COORD.lat) / 2, lng: (userLng + DESTINATION_COORD.lng) / 2 } },
            { instruction: 'Chegada na MotoModas Curado III à sua direita!', distance: 'Chegou', icon: 'arrive', coords: DESTINATION_COORD }
          ]
        };

        setSelectedOrigin('my_location');
      },
      (error) => {
        setGeolocationError('Não foi possível obter sua localização (Permissão negada ou erro de GPS).');
      }
    );
  };

  // Google Maps Renderer inside the APIProvider
  const RenderInnerMap = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;
      map.setCenter(DESTINATION_COORD);
      map.setZoom(16);
    }, [map]);

    return (
      <AdvancedMarker position={DESTINATION_COORD} title="MotoModas Loja Física">
        <div className="bg-amber-500 text-black font-black p-2 rounded-2xl flex items-center gap-1 shadow-2xl relative border-2 border-zinc-950 scale-105">
          <Car className="w-5 h-5" />
          <span className="text-[10px] font-sans font-black uppercase tracking-tight">MotoModas</span>
        </div>
      </AdvancedMarker>
    );
  };
      // RENDER DUAL FLEXIBLE MAP WORKSPACE (Use Embed Map Iframe as high-fidelity zero-config fallback)
  const renderMapViewport = () => {
    if (!hasValidKey) {
      return (
        <div className="h-[600px] w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-805 relative shadow-2xl">
          <iframe
            src="https://maps.google.com/maps?q=-8.082729,-34.977239&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.25) brightness(1.15)' }}
            allowFullScreen={false}
            loading="lazy"
            title="Localização MotoModas Jaboatão"
            className="w-full h-full rounded-2xl"
          />

          {/* Quick info-tag floating overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/95 border border-zinc-800 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl max-w-md">
            <div className="flex gap-2.5 items-center w-full sm:w-auto">
              <div className="w-10 h-10 bg-amber-500 text-black flex items-center justify-center rounded-xl font-bold font-mono shrink-0">
                MM
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Sede MotoModas Curado III</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[180px] sm:max-w-[240px]">
                  {STORE_ADDRESS}
                </p>
              </div>
            </div>
            
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(STORE_ADDRESS)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-3.5 py-2 rounded-xl text-[10px] font-bold text-zinc-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center"
            >
              Abrir no GPS
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Subtly indicate tracking capability with Google key configuration */}
          <div className="absolute top-4 right-4 bg-zinc-950/95 border border-zinc-800 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[9px] font-mono text-zinc-400 flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Mapa MotoModas Ativo</span>
          </div>
        </div>
      );
    }

    return (
      <div className="h-[600px] w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 relative shadow-2xl">
        <Map
          defaultCenter={DESTINATION_COORD}
          defaultZoom={16}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <RenderInnerMap />
        </Map>

        {/* Quick info-tag floating overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xl max-w-md">
          <div className="flex gap-2.5 items-center">
            <div className="w-10 h-10 bg-amber-500 text-black flex items-center justify-center rounded-xl font-bold font-mono">
              MM
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Sede MotoModas Curado III</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[180px] sm:max-w-[240px]">
                {STORE_ADDRESS}
              </p>
            </div>
          </div>
          
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(STORE_ADDRESS)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-950 border border-zinc-805 hover:bg-zinc-800 hover:text-white px-3.5 py-2 rounded-xl text-[10px] font-bold text-zinc-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0"
          >
            Abrir no GPS
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  };

  const layoutContent = (
    <div className="w-full bg-zinc-950 text-white min-h-[60vh]">
      {renderMapViewport()}
    </div>
  );

  if (hasValidKey) {
    return (
      <APIProvider apiKey={API_KEY} version="weekly">
        {layoutContent}
      </APIProvider>
    );
  }

  return layoutContent;
}
