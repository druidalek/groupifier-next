import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';

import {
  activityCodeToName,
  activityDurationString,
  parseActivityCode,
  roomsWithTimezoneAndGroups,
} from '../../../../logic/activities';

import { hasAssignment } from '../../../../logic/competitors';
import { flatMap, sortByArray } from '../../../../logic/utils';

const Preview = ({ wcif, selectedRound }) => {
  console.log(selectedRound);

  const overviewForGroup = (wcif, room, timezone, groupActivity) => {
    const headersWithPeople = [
      ['Competitors', 'competitor'],
      ['Scramblers', 'staff-scrambler'],
      ['Runners', 'staff-runner'],
      ['Judges', 'staff-judge'],
    ]
      .map(([header, assignmentCode]) => [
        header,
        wcif.persons.filter(person =>
          hasAssignment(person, groupActivity.id, assignmentCode)
        ),
      ])
      .filter(([header, people]) => people.length > 0);
    return headersWithPeople;
    return {
      unbreakable: true,
      margin: [0, 0, 0, 10],
      stack: [
        {
          text: activityCodeToName(groupActivity.activityCode),
          bold: true,
          fontSize: 14,
        },
        {
          columns: [
            `Time: ${activityDurationString(groupActivity, timezone)}`,
            `Room: ${room.name}`,
          ],
          margin: [0, 5, 0, 5],
        },
      ],
    };
  };

  console.log(
    flatMap(
      roomsWithTimezoneAndGroups(wcif, selectedRound.id),
      ([room, timezone, groupActivities]) =>
        groupActivities.map(groupActivity => [room, timezone, groupActivity])
    )
  );
  const data = sortByArray(
    flatMap(
      roomsWithTimezoneAndGroups(wcif, selectedRound.id),
      ([room, timezone, groupActivities]) =>
        groupActivities.map(groupActivity => [room, timezone, groupActivity])
    ),
    ([room, timezone, { startTime, activityCode }]) => [
      startTime,
      parseActivityCode(activityCode).groupNumber,
    ]
  ).map(([room, timezone, groupActivity]) =>
    overviewForGroup(wcif, room, timezone, groupActivity)
  );
  console.log(data);
  // const a = flatMap(
  //     flatMap(rounds, round => roomsWithTimezoneAndGroups(wcif, round.id)),
  //     ([room, timezone, groupActivities]) =>
  //       groupActivities.map(groupActivity => [room, timezone, groupActivity])
  //   ),
  //   ([room, timezone, { startTime, activityCode }]) => [
  //     startTime,
  //     parseActivityCode(activityCode).groupNumber,
  //   ]
  // ).map(([room, timezone, groupActivity]) =>
  //   overviewForGroup(wcif, room, timezone, groupActivity)
  // );

  //   const headersWithPeople = [
  //     ['Competitors', 'competitor'],
  //     ['Scramblers', 'staff-scrambler'],
  //     ['Runners', 'staff-runner'],
  //     ['Judges', 'staff-judge'],
  //   ]
  //     .map(([header, assignmentCode]) => [
  //       header,
  //       wcif.persons.filter(person =>
  //         hasAssignment(person, groupActivity.id, assignmentCode)
  //       ),
  //     ])
  //     .filter(([header, people]) => people.length > 0);
  //     console.log(headersWithPeople);
  return (
    <Paper style={{ padding: 16 }}>
      <List style={{ width: 400 }}>
        {wcif.persons.map(person => (
          <ListItem key={person.id}>{person.name}</ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Preview;
