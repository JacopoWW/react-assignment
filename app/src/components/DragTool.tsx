import {
  Draggable,
  DraggableProps,
  Droppable,
  DroppableProps,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import React, { HTMLAttributes } from "react";
import _ from "lodash";
import classNames from "classnames";

export const renderWithDroppable = <T extends unknown[]>(
  config: Omit<DroppableProps, "children"> & HTMLAttributes<HTMLElement>,
  render: (provided: DroppableProvided, snapshot: DroppableStateSnapshot, ...arg: T) => React.ReactNode
): ((...arg: T) => React.ReactNode) => {
  return (...arg: T) => (
    <Droppable {...config}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={classNames(config.className, {
            'bg-gray-200': snapshot.isDraggingOver,
          })}
        >
          {render(provided, snapshot, ...arg)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export const withDraggable = <T extends {}>(
  Comp: React.ComponentType<T>
): React.FC<
  {
    compProps: T;
    handler?: HTMLAttributes<HTMLElement>;
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
      handler: handler,
    } = props;
    const [draggable, toggleDraggable] = React.useState(false);
    const check = React.useRef<HTMLInputElement>();
    React.useEffect(() => {
      check.current && (check.current.checked = draggable);
      check.current?.addEventListener("change", (e) => {
        const checkbox = e.target as HTMLInputElement;
        toggleDraggable(checkbox?.checked || false);
      });
    }, []);
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
            className={classNames('flex relative', {
              'bg-blue-200 cursor-grabbing': snapshot.isDragging,
            })}
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
