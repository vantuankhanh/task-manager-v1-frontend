import { useNavigate } from "react-router-dom";

export interface ICardProps {
  label: string;
  value: number;
  icon: string;
  url: string;
}

interface ICardData {
  cardProps: ICardProps[];
}

export const CardItem = ({ cardProps }: ICardData) => {
  const nav = useNavigate();

  return (
    <>
      {cardProps.map((item, index) => (
        <div key={index} className="col-12 lg:col-6 xl:col-3">
          <div className="card mb-0">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-bold mb-3 text-2xl">
                  Total {item.label}
                </span>
                <div className="text-900 font-medium text-3xl">
                  {item.value}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-blue-100 border-round cursor-pointer"
                style={{ width: "2.5rem", height: "2.5rem" }}
                onClick={() => nav(item.url)}
              >
                <i className={item.icon} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
