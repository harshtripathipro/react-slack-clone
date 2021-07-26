import React from "react";
import { Segment, Accordion, Icon, Header, Image } from "semantic-ui-react";
import { useEffect, useState } from "react";

const MetaPanel = (props) => {
  const [metaPanel, setMetapanel] = useState({
    activeIndex: 0,
    privateChannel: props.isPrivateChannel,
    channel: props.currentChannel,
  });

  const setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = metaPanel;
    const newIndex = activeIndex === newIndex ? -1 : index;
    setMetapanel({
      ...metaPanel,
      activeIndex: newIndex,
    });
  };

  const { activeIndex, privateChannel, channel } = metaPanel;

  if (privateChannel) return null;
  else {
    return (
      <Segment loading={!channel}>
        <Header as='h3' attached='top'>
          About # {channel && channel.name}
        </Header>
        <Accordion styled attached='true'>
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={setActiveIndex}
          >
            <Icon name='dropdown' />
            <Icon name='info' />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {channel && channel.details}
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={setActiveIndex}
          >
            <Icon name='dropdown' />
            <Icon name='user circle' />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            posters
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={setActiveIndex}
          >
            <Icon name='dropdown' />
            <Icon name='pencil alternate' />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as='h3'>
              <Image circular src={channel && channel.createdBy.avatar} />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
};
export default MetaPanel;
