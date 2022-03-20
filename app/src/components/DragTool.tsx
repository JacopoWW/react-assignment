import {
  Draggable,
  DraggableProps,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProps,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import React, { HTMLAttributes } from "react";
import _ from 'lodash';
import classNames from "classnames";

export const renderWithDroppable = <T extends unknown[]>(
  config: Omit<DroppableProps, "children"> & {
    mapContainerAttrs?: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => Omit<HTMLAttributes<HTMLElement>, keyof DroppableProvided['droppableProps']>;
    noPlaceHolder?: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => boolean;
  },
  render: (provided: DroppableProvided, snapshot: DroppableStateSnapshot, ...arg: T) => React.ReactNode
): ((...arg: T) => React.ReactNode) => {
  return (...arg: T) => (
    <Droppable {...config}>
      {(provided, snapshot) => <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        {... _.invoke(config, 'mapContainerAttrs', provided, snapshot)}
      >
        {render(provided, snapshot, ...arg)}
        <div className={classNames({
          hidden: config.noPlaceHolder && config.noPlaceHolder(provided, snapshot),
        })}>
          {provided.placeholder}
        </div>
      </div>}
    </Droppable>
  );
};

export const withDraggable = <T extends {}>(
  Comp: React.ComponentType<T>,
  mapContainerAttrs?: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => Omit<HTMLAttributes<HTMLElement>, keyof DraggableProvided['draggableProps']>,
): React.FC<
  {
    compProps: T;
    handler?: Omit<HTMLAttributes<HTMLElement>, keyof Exclude<DraggableProvided['dragHandleProps'], undefined>>;
  } & Omit<DraggableProps, "children">
> => {
  return (props) => {
    const {
      children,
      draggableId,
      index,
      isDragDisabled,
      disableInteractiveElementBlocking,
      shouldRespectForcePress,
      compProps,
      handler,
    } = props;
    // const [draggable, toggleDraggable] = React.useState(false);
    // const check = React.useRef<HTMLInputElement>();
    // React.useEffect(() => {
    //   check.current && (check.current.checked = draggable);
    //   check.current?.addEventListener("change", (e) => {
    //     const checkbox = e.target as HTMLInputElement;
    //     toggleDraggable(checkbox?.checked || false);
    //   });
    // }, []);
    return (
      <Draggable
        draggableId={draggableId}
        index={index}
        isDragDisabled={isDragDisabled}
        disableInteractiveElementBlocking={disableInteractiveElementBlocking}
        shouldRespectForcePress={shouldRespectForcePress}
      >
        {(provided, snapshot) => (
          <div
            {...(mapContainerAttrs && mapContainerAttrs(provided, snapshot))}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <Comp {...compProps}>{children}</Comp>
            <div
              {...provided.dragHandleProps}
              {...handler}
            />
          </div>
        )}
      </Draggable>
    );
  };
};
