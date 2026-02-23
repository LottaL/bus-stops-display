import AcUnitIcon from '@mui/icons-material/AcUnit'; //snow
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudySnowingIcon from '@mui/icons-material/CloudySnowing';
import FoggyIcon from '@mui/icons-material/Foggy';
import GrainIcon from '@mui/icons-material/Grain';
import SunnyIcon from '@mui/icons-material/Sunny';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Badge, IconProps, Stack } from '@mui/material';
import { HourlyForecast } from '../services/weatherApi';

interface WeatherIconProps {
  forecast: HourlyForecast;
}
const ClearSkyIcon = (timeOfDay: number, fontSize: IconProps['fontSize']) => {
  if (timeOfDay >= 6 && timeOfDay < 18) {
    return <SunnyIcon fontSize={fontSize} sx={{ color: '#ecd86f' }} />;
  } else {
    return <BedtimeIcon fontSize={fontSize} sx={{ color: '#dfd5a6' }} />;
  }
};

export const WeatherIcon = ({ forecast }: WeatherIconProps) => {
  const { weatherCode, time } = forecast;
  const timeOfDay = new Date(time).getHours();
  switch (weatherCode) {
    case 0:
      // clear sky day or night
      return ClearSkyIcon(timeOfDay, 'medium');

    case 1:
    case 2: {
      // partly cloudy day or night
      if (timeOfDay >= 6 && timeOfDay < 18) {
        return (
          <Badge
            badgeContent={<SunnyIcon fontSize="medium" sx={{ color: '#ecd86f' }} />}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <CloudIcon fontSize="medium" />
          </Badge>
        );
      } else {
        return (
          <Badge
            badgeContent={<BedtimeIcon fontSize="medium" sx={{ color: '#e5dba5' }} />}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <CloudIcon fontSize="medium" />
          </Badge>
        );
      }
    }
    case 3:
      // cloudy
      return <CloudIcon fontSize="medium" />;

    case 45:
    case 48:
      // fog
      return <FoggyIcon fontSize="medium" sx={{ color: '#89b4cc' }} />;

    case 51:
    case 53:
    case 55:
    case 80:
    case 81:
    case 82:
      // 51-55 drizzle
      // 0-82 rain showers
      return (
        <Badge
          badgeContent={ClearSkyIcon(timeOfDay, 'small')}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <WaterDropIcon fontSize="small" sx={{ color: '#1793d6' }} />
          <CloudySnowingIcon fontSize="medium" />
        </Badge>
      );

    case 61:
    case 63:
    case 65:
      // rain
      return <WaterDropIcon fontSize="medium" sx={{ color: '#89b4cc' }} />;

    case 56:
    case 57:
    case 66:
    case 67:
      // 56-57 freezing drizzle
      // freezing rain
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Badge
            badgeContent={<AcUnitIcon fontSize="small" />}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <WaterDropIcon fontSize="small" sx={{ color: '#89b4cc' }} />
          </Badge>
          <CloudySnowingIcon fontSize="medium" />
        </Stack>
      );

    case 71:
    case 73:
    case 75:
    case 77:
      // snow
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <AcUnitIcon fontSize="small" />
          <CloudySnowingIcon fontSize="medium" />
        </Stack>
      );

    case 85:
    case 86:
      // snow showers
      return (
        <Badge
          badgeContent={ClearSkyIcon(timeOfDay, 'small')}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <AcUnitIcon fontSize="small" />
          <CloudySnowingIcon fontSize="medium" />
        </Badge>
      );

    case 95:
      // thunderstorm
      return <ThunderstormIcon fontSize="medium" />;

    case 96:
    case 99:
      // thunderstorm with hail
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <GrainIcon fontSize="small" />
          <ThunderstormIcon fontSize="medium" />
        </Stack>
      );

    default:
      // unknown weather code
      return <span>?</span>;
  }
};
