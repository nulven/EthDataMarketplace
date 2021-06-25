import React  from 'react';
import styled from 'styled-components';


const DateWrapper = styled.div`
  display: block;
  color: ${props => props.theme.color.grey50};
`;

type TimeBreakType = [number, string];
type TimeBreaksType = TimeBreakType[];
const TimeBreaks: TimeBreaksType = [
  [1*7*24*60*60*1000, '1 week ago'],
  [6*24*60*60*1000, '6 days ago'],
  [5*24*60*60*1000, '5 days ago'],
  [4*24*60*60*1000, '4 days ago'],
  [3*24*60*60*1000, '3 days ago'],
  [2*24*60*60*1000, '2 days ago'],
  [1*24*60*60*1000, '1 day ago'],
  [2*60*60*1000, '2 hours ago'],
  [1*60*60*1000, '1 hour ago'],
  [6*60*1000, '5 minutes ago'],
  [5*60*1000, '4 minutes ago'],
  [4*60*1000, '3 minutes ago'],
  [3*60*1000, '2 minutes ago'],
  [2*60*1000, '1 minutes ago'],
  [1*60*1000, 'seconds ago'],
]; // breaks in milliseconds

type DateProps = {
  timestamp: Date;
};

const DateDiv = (props: DateProps) => {

  const now = new Date();
  const elapsedTime = now.getTime() - props.timestamp.getTime();
  var text = props.timestamp.toLocaleDateString();
  TimeBreaks.forEach(([diff, value]) => {
    if (elapsedTime < diff) {
      text = value;
    }
  });

  return (
    <DateWrapper>{text}</DateWrapper>
  );
};

export default DateDiv;
