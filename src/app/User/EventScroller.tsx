import React from 'react';
import styled from 'styled-components';


const EventScrollerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 200px;
  overflow-y: auto;
  background-color: ${props => props.theme.color.grey30};
  padding-top: 2%;
  padding-bottom: 2%;
  margin-bottom: 30px;
`;

type EventScrollerProps = {
  events: [];
  card: any;
}

const EventScroller = (props) => {
  const sortedEvents = props.events.sort((a ,b) => {
    const aDate = new Date(a.timestamp);
    const bDate = new Date(b.timestamp);
    return bDate.getTime() - aDate.getTime();
  });
  return (
    <EventScrollerWrapper>
      {sortedEvents.map((event, index) => {
        return (
          <props.card key={index} {...event} />
        );
      })}
    </EventScrollerWrapper>
  );
};

export default EventScroller;
