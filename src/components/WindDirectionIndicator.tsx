import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Badge, Box } from '@mui/material';
import AirIcon from '@mui/icons-material/Air';

type Props = {
  windDirection: number; // degrees (0–360)
  windSpeed?: number; // optional, in m/s
};

export function WindDirectionIndicator({ windDirection, windSpeed }: Props) {
  return (
    <Badge
      badgeContent={
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${windDirection}deg)`,
            transition: 'transform 0.3s ease',
          }}
        >
          <ArrowUpwardIcon sx={{ color: windSpeed && windSpeed > 20 ? '#ff0000' : '#ffffff' }} />
        </Box>
      }
    >
      <AirIcon fontSize="medium" sx={{ color: '#89b4cc' }} />
    </Badge>
  );
}
