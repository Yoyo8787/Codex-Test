import { SVGProps } from "react";

function createIcon(
  ComponentName: string,
  path: JSX.Element,
  viewBox = "0 0 24 24"
) {
  const Component = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      viewBox={viewBox}
      {...props}
    >
      {path}
    </svg>
  );
  Component.displayName = ComponentName;
  return Component;
}

export const PlusIcon = createIcon(
  "PlusIcon",
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
);

export const ArrowPathIcon = createIcon(
  "ArrowPathIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M4.5 9A7.5 7.5 0 0 1 12 3a7.5 7.5 0 0 1 7.5 7.5m0 0H18m1.5 0V6m0 9A7.5 7.5 0 0 1 12 21a7.5 7.5 0 0 1-7.5-7.5m0 0H6m-1.5 0V18"
  />
);

export const ArrowTrendingUpIcon = createIcon(
  "ArrowTrendingUpIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 17 9 11l4 4 8-8m0 0h-5m5 0v5"
  />
);

export const ArrowTrendingDownIcon = createIcon(
  "ArrowTrendingDownIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="m21 7-6 6-4-4-8 8m0 0h5m-5 0v-5"
  />
);

export const LinkIcon = createIcon(
  "LinkIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9.75 9.75 6 13.5a3 3 0 1 0 4.243 4.243l1.757-1.757m2.25-2.25L18 10.5a3 3 0 1 0-4.243-4.243L12 7.5"
  />
);

export const BellAlertIcon = createIcon(
  "BellAlertIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 6a4 4 0 0 0-4 4v1.5c0 .884-.316 1.74-.89 2.414L6.22 15.3A1 1 0 0 0 7 17h10a1 1 0 0 0 .78-1.7l-.89-1.386A4.002 4.002 0 0 1 16 11.5V10a4 4 0 0 0-4-4Zm0 13.5a2.5 2.5 0 0 1-2.45-2h4.9a2.5 2.5 0 0 1-2.45 2Zm-5.25-12h-.008v-.008H6.75V7.5h-.008V6.75H5.25v.742h-.75v1.492h.75v.75h1.5v-.75Zm11.258 0h-.008v-.008H18.01V7.5h-.008V6.75h-1.492v.742h-.75v1.492h.75v.75h1.5v-.75Z"
  />
);

export const CheckCircleIcon = createIcon(
  "CheckCircleIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9.75 12.75 11 14l3.75-3.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
  />
);

export const XMarkIcon = createIcon(
  "XMarkIcon",
  <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
);

export const TrashIcon = createIcon(
  "TrashIcon",
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M6 7h12m-9 4v6m6-6v6M9 7l1-2h4l1 2m-9 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"
  />
);
