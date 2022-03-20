import React, { useMemo, useState } from "react";
import {
  Data,
  Member,
  Controller,
  Org,
  AppContext,
  DataType,
} from "./dataService";
import { MemberForm, OrgCard, OrgCardProps } from "./components/OrgCard";
import { WiredCard, WiredButton } from "react-wired-elements";
import _ from "lodash";
import { DragDropContext, DropResult, DragStart, DragUpdate, BeforeCapture } from "react-beautiful-dnd";
import { renderWithDroppable, withDraggable } from "./components/DragTool";
import classNames from "classnames";

export function useOrg(data: Data, ctr: Controller): AppContext {
  const [orgState, setOrgState] = React.useState<Org[]>(data.orgData);
  const [memberState, setMemberState] = React.useState<Member[]>(
    data.memberData
  );
  const methods: Omit<AppContext, 'memberState' | 'orgState'> = React.useMemo(() => ({
    editMember(memberId, orgId, key, val) {
      console.log("编辑了Member");
      const m = data.get(DataType.MEMBER, memberId);
      if (key === "representation") {
        methods.editOrg(orgId, key, memberId);
      } else if (m) {
        const member = _.clone(m);
        member[key] = val;
        data.put(DataType.MEMBER, member);
        const newMemberData = data.memberData.slice();
        setMemberState(newMemberData);
        console.log("修改后", member.name);
      }
    },
    editOrg(orgId, key, val) {
      console.log('编辑了ORg', orgId, key, val)
      const o = data.get(DataType.ORG, orgId);
      if (o) {
        const org = _.clone(o);
        org[key] = val;
        data.put(DataType.ORG, org);
        const newOrgData = data.orgData.slice();
        setOrgState(newOrgData);
      }
    },
    addMember(orgId) {
      if (ctr.addMember(orgId)) {
        const newMemberData = data.memberData.slice();
        const newOrgState = data.orgData.slice();
        setMemberState(newMemberData);
        setOrgState(newOrgState);
      }
    },
    addOrg() {
      const org = ctr.addOrg();
      const newOrgState = data.orgData.slice();
      setOrgState(newOrgState);
      return org;
    },
    getMembers(orgId) {
      return ctr.findOrgMember(orgId);
    },
    getSubOrgs(orgId) {
      return ctr.findSubOrg(orgId);
    },
    reset() {
      data.reset();
      setOrgState(data.orgData);
      setMemberState(data.memberData);
      alert("数据已恢复到默认！");
    },
    save() {
      data.save();
      alert("数据已保存！");
    },
  }), [data, ctr])
  const context: AppContext = {
    ...methods,
    memberState,
    orgState,
  };
  return context;
}

const DraggableOrgCard = withDraggable(OrgCard, (provide, snapshot) => ({
  className: classNames('relative bg-white overflow-x-visible', {
    "bg-blue-200": snapshot.isDragging,
  }),
}));
const DraggableMemberForm = withDraggable(MemberForm, (provide, snapshot) => ({
  className: classNames('flex overflow-x-visible', {
    "bg-blue-200": snapshot.isDragging,
  }),
}));

const App: React.FC = () => {
  const config = useMemo(() => {
    const data = new Data();
    const ctr = new Controller(data);
    return {
      data,
      ctr,
    };
  }, []);
  const context = useOrg(config.data, config.ctr);
  const [rootOrgList, setRootOrgList] = useState(
    context.orgState.filter((org) => org.parent === null).map((org) => org.id)
  );
  // const [draggingState, setDragSate] = useState({
  //   member: false,
  //   org: false,
  // });
  const [draggingId, setDragging] = useState<string | null>(null);
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    setDragging(null);
    console.log(
      result,
      '拖拽完成'
    );
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if ( // root之间
      source.droppableId === "main-1" &&
      source.droppableId === destination.droppableId
    ) {
      const newRootList = rootOrgList.slice();
      const sourceItem = newRootList[source.index];
      newRootList.splice(source.index, 1);
      newRootList.splice(destination.index, 0, sourceItem);
      setRootOrgList(newRootList);
    } else if (result.type === DataType.MEMBER && source.droppableId === destination.droppableId) { // 非main下的拖拽

    }

    // setDragSate({
    //   member: false,
    //   org: false,
    // });
  };

  const onBeforeCapture = (info: BeforeCapture) => {
    setDragging(info.draggableId);
    // const newDragState = _.clone(draggingState);
    // newDragState[type as DataType] = true;
    // console.log('拖动之前', info, type, newDragState);
    // requestAnimationFrame(() => setDragSate(newDragState));
  };
  const onBeforeStart = (info: DragStart) => {
    // 在开始拖之前先把 这个元素放在root里
    // setDraggingOver(info.source.droppableId);
  }

  const onDragUpdate = (info: DragUpdate) => {
    console.log('drag状态更新', info.destination?.droppableId)
  }

  // const check = React.useRef<HTMLInputElement>();
  // React.useEffect(() => {
  //   check.current && (check.current.checked = lockDraggle);
  //   check.current?.addEventListener("change", (e) => {
  //     const checkbox = e.target as HTMLInputElement;
  //     toggleDraggle(checkbox?.checked || false);
  //   });
  // }, []);
  console.log("app重新渲染了");
  return (
    <WiredCard
      className="app grid grid-cols-1 grid-rows-1 relative h-[100vh] w-full p-8 bg-white"
      elevation={1}
    >
      <div className="h-full w-full flex flex-col">
        <h4 className="flex flex-0 items-center text-5xl my-5">
          Org Management
        </h4>
        <div className="flex-1 w-full overflow-y-auto">
          <DragDropContext
            onDragEnd={onDragEnd}
            onBeforeCapture={onBeforeCapture}
            onDragUpdate={onDragUpdate}
            onBeforeDragStart={onBeforeStart}
          >
            {renderWithDroppable(
              {
                droppableId: "main-1",
                direction: "vertical",
                type: DataType.ORG,
                mapContainerAttrs: (provided, snapshot) => ({
                  className: classNames('relative flex flex-col', {
                    "bg-gray-200": snapshot.isDraggingOver,
                  }),
                }),
              },
              (provided, snapshot) => rootOrgList.map((orgId: string, index) => {
                    const org = config.data.get(DataType.ORG, orgId) as Org;
                    // console.log('snapshot信息', snapshot.draggingFromThisWith, snapshot.draggingOverWith, snapshot.isDraggingOver);
                    // setDraggingOver(snapshot.draggingFromThisWith || null);
                    // console.log(`${org.id}-${DataType.ORG}`, draggingId, provided.);
                    const renderChildCards: OrgCardProps["renderChildCards"] =
                      renderWithDroppable(
                        {
                          droppableId: `${orgId}-${DataType.ORG}`,
                          direction: "vertical",
                          type: DataType.ORG,
                          mapContainerAttrs: (provide, snapshot) => ({
                            className: classNames('relative py-10', {
                              "bg-gray-200": snapshot.isDraggingOver,
                            })
                          }),
                        },
                        (orgProvided, orgSnapshot, p, orgs) => orgs.map((sub, index) => {
                          return (
                              <DraggableOrgCard
                                compProps={{
                                  ...p,
                                  org: sub,
                                  forceClose: draggingId === sub.id,
                                }}
                                key={sub.id}
                                draggableId={sub.id}
                                index={index}
                                handler={{
                                  className:
                                    "absolute w-10 h-10 top-7 left-5 bg-orange-300 rounded-lg",
                                }}
                                
                              />
                            )
                          }
                        )
                      );
                    const renderChildFields: OrgCardProps["renderChildFields"] =
                      renderWithDroppable(
                        {
                          droppableId: `${orgId}-${DataType.MEMBER}`,
                          direction: "vertical",
                          type: DataType.MEMBER,
                          mapContainerAttrs: (provide, snapshot) => ({
                            className: classNames('relative', {
                              "bg-gray-200": snapshot.isDraggingOver,
                            })
                          }),
                        },
                        (provide, snap, p, members) => members.map((member, index) => (
                              <DraggableMemberForm
                                key={member.id}
                                compProps={{
                                  member,
                                  org: p.org,
                                  onEdit: p.editMember,
                                }}
                                handler={{
                                  className: classNames(
                                    "w-8 h-8 rounded-lg bg-red-300"
                                  ),
                                }}
                                draggableId={member.id}
                                index={index}
                              />
                            ))
                        );
                    return (
                      <DraggableOrgCard
                        compProps={{
                          getMembers: context.getMembers,
                          getSubOrgs: context.getSubOrgs,
                          addMember: context.addMember,
                          editMember: context.editMember,
                          editOrg: context.editOrg,
                          org: org,
                          forceClose: draggingId === org.id,
                          renderChildCards,
                          renderChildFields,
                        }}
                        handler={{
                          className:
                            "absolute w-10 h-10 top-7 left-5 bg-orange-300 rounded-lg",
                        }}
                        key={orgId}
                        draggableId={orgId}
                        index={index}
                      />
                    );
                  }
                  
              )
            )()}
          </DragDropContext>
        </div>

        <div className="flex flex-none border-t-2 border-black justify-between py-4">
          <div>
            <WiredButton
              onClick={() => {
                const org = context.addOrg();
                const newOrgList = rootOrgList.concat(org.id);
                setRootOrgList(newOrgList);
              }}
              className="text-2xl"
            >
              Add
            </WiredButton>
          </div>
          <div>
            <WiredButton onClick={context.reset} className="text-2xl mr-4">
              Cancel
            </WiredButton>
            <WiredButton onClick={context.save} className="text-2xl">
              Save
            </WiredButton>
          </div>
        </div>
      </div>
    </WiredCard>
  );
};

export default App;
