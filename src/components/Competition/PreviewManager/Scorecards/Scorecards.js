import React, { useState, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import CubingIcon from '../../../common/CubingIcon/CubingIcon';
import {
  roundsWithoutResults,
  parseActivityCode,
  activityCodeToName,
  roomsWithTimezoneAndGroups,
} from '../../../../logic/activities';
import { sortBy } from '../../../../logic/utils';
import Preview from '../Preview/Preview';

import { flatMap, sortByArray } from '../../../../logic/utils';

const Scorecards = ({ wcif }) => {
  const [selectedRound, setSelectedRound] = useState({});

  const rounds = sortBy(
    roundsWithoutResults(wcif).filter(
      round => parseActivityCode(round.id).eventId !== '333fm'
    ),
    round => parseActivityCode(round.id).roundNumber
  );

  const handleRoundClick = round => {
    setSelectedRound(round);
  };

  return (
    <Fragment>
      <Paper style={{ padding: 16 }}>
        <Typography variant="subtitle1">Select rounds</Typography>
        <List style={{ width: 400 }}>
          {rounds.map(round => (
            <ListItem
              key={round.id}
              button
              onClick={() => handleRoundClick(round)}
            >
              <ListItemIcon>
                <CubingIcon eventId={parseActivityCode(round.id).eventId} />
              </ListItemIcon>
              <ListItemText primary={activityCodeToName(round.id)} />
              {flatMap(
                roomsWithTimezoneAndGroups(wcif, selectedRound.id),
                ([room, timezone, groupActivities]) =>
                  groupActivities.map(groupActivity => [
                    room,
                    timezone,
                    groupActivity,
                  ])
              ).map(group => {
                console.log(group);
                return (
                  <Button key={group.groupActivity.id}>
                    {group.groupActivity.name}
                  </Button>
                );
              })}
            </ListItem>
          ))}
        </List>
      </Paper>
      <Preview wcif={wcif} selectedRound={selectedRound} />
    </Fragment>
  );
};

export default Scorecards;
