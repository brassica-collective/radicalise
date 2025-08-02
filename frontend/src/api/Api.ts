/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum ParticipationIntention {
  OptIn = "OptIn",
  OptOut = "OptOut",
}

export enum OptOutType {
  Hiatus = "Hiatus",
  Exit = "Exit",
}

export enum InvolvementStatus {
  Participating = "Participating",
  OnHiatus = "OnHiatus",
  Exiting = "Exiting",
}

export enum EoiError {
  CollectiveNotFound = "CollectiveNotFound",
  EoiNotFound = "EoiNotFound",
  EoiFeatureDisabled = "EoiFeatureDisabled",
  EmailAlreadyExists = "EmailAlreadyExists",
}

export type AppEvent =
  | {
      MeEvent: MeEvent;
    }
  | {
      IntervalsEvent: IntervalsEvent;
    }
  | {
      CrewsEvent: CrewsEvent;
    }
  | {
      CollectiveEvent: CollectiveEvent;
    }
  | {
      PeopleEvent: PeopleEvent;
    }
  | {
      EntryPathwayEvent: EntryPathwayEvent;
    };

export interface CapacityPlanning {
  capacity?: string | null;
  focus?: string | null;
  wellbeing?: string | null;
}

export interface Collective {
  description?: string | null;
  eoi_description?: string | null;
  feature_eoi: boolean;
  /** @format int64 */
  id: number;
  links: Link[];
  name?: string | null;
  noun_name?: string | null;
  slug?: string | null;
}

export type CollectiveEvent = {
  CollectiveUpdated: Collective;
};

export interface CollectiveInvolvement {
  capacity_planning?: null | CapacityPlanning;
  /** @format int64 */
  capacity_score?: number | null;
  /** @format int64 */
  collective_id: number;
  /** @format int64 */
  id: number;
  intention_context?: string | null;
  /** @format int64 */
  interval_id: number;
  opt_out_planned_return_date?: string | null;
  opt_out_type?: null | OptOutType;
  participation_intention?: null | ParticipationIntention;
  /** @format int64 */
  person_id: number;
  private_capacity_planning: boolean;
  status: InvolvementStatus;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface CrewInvolvement {
  convenor: boolean;
  /** @format int64 */
  crew_id: number;
  /** @format int64 */
  id: number;
  /** @format int64 */
  interval_id: number;
  /** @format int64 */
  person_id: number;
  volunteered_convenor: boolean;
}

export interface CrewWithLinks {
  /** @format int64 */
  collective_id: number;
  description?: string | null;
  /** @format int64 */
  id: number;
  links?: any[] | null;
  name: string;
}

export type CrewsEvent = {
  CrewUpdated: CrewWithLinks;
};

export interface EntryPathway {
  /** @format int64 */
  collective_id: number;
  conflict_experience?: string | null;
  context?: string | null;
  /** @format int64 */
  id: number;
  interest?: string | null;
  name: string;
  participant_connections?: string | null;
  referral?: string | null;
}

export type EntryPathwayEvent = {
  EntryPathwayUpdated: EntryPathway;
};

export interface ExpressionOfInterest {
  /** @format int64 */
  collective_id: number;
  conflict_experience?: string | null;
  context?: string | null;
  email: string;
  /** @format int64 */
  id: number;
  interest?: string | null;
  name: string;
  participant_connections?: string | null;
  referral?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface InitialData {
  collective: Collective;
  crews: CrewWithLinks[];
  current_interval: Interval;
  entry_pathways: EntryPathway[];
  intervals: Interval[];
  involvements: InvolvementData;
  people: Person[];
}

export interface Interval {
  end_date: string;
  /** @format int64 */
  id: number;
  start_date: string;
}

export interface IntervalInvolvementData {
  collective_involvements: CollectiveInvolvement[];
  crew_involvements: CrewInvolvement[];
  /** @format int64 */
  interval_id: number;
}

export type IntervalsEvent = {
  IntervalCreated: Interval;
};

export interface InvolvementData {
  current_interval?: null | IntervalInvolvementData;
  next_interval?: null | IntervalInvolvementData;
}

export interface Link {
  label?: string | null;
  link_type: string;
  url: string;
}

export interface LoginResponse {
  /** @format int64 */
  user_id: number;
}

export type MeEvent = {
  IntervalDataChanged: PersonIntervalInvolvementData;
};

export interface MyInitialData {
  current_interval?: null | PersonIntervalInvolvementData;
  next_interval?: null | PersonIntervalInvolvementData;
  /** @format int64 */
  person_id: number;
}

export interface MyParticipationInput {
  capacity?: string | null;
  /** @format int64 */
  capacity_score?: number | null;
  /** @format int64 */
  collective_id: number;
  crew_involvements?: any[] | null;
  focus?: string | null;
  intention_context?: string | null;
  opt_out_planned_return_date?: string | null;
  opt_out_type?: null | OptOutType;
  participation_intention?: null | ParticipationIntention;
  private_capacity_planning: boolean;
  wellbeing?: string | null;
}

export type PeopleEvent = {
  PersonUpdated: Person;
};

export interface Person {
  about?: string | null;
  /** @format int64 */
  avatar_id?: number | null;
  /** @format int64 */
  collective_id: number;
  display_name: string;
  /** @format int64 */
  id: number;
}

export interface PersonIntervalInvolvementData {
  collective_involvement?: null | CollectiveInvolvement;
  crew_involvements: CrewInvolvement[];
  /** @format int64 */
  interval_id: number;
  /** @format int64 */
  person_id: number;
}

export interface ResetPasswordRequest {
  password: string;
  token: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title radicalise
 * @version 1.2.2
 * @license
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @name ForgotPassword
     * @request POST:/api/auth/forgot_password
     */
    forgotPassword: (data: ForgotPasswordRequest, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/api/auth/forgot_password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name Login
     * @request POST:/api/auth/login
     */
    login: (data: Credentials, params: RequestParams = {}) =>
      this.request<LoginResponse, string>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ResetPassword
     * @request POST:/api/auth/reset_password
     */
    resetPassword: (data: ResetPasswordRequest, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/api/auth/reset_password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateCrew
     * @request PUT:/api/crews/{crew_id}
     */
    updateCrew: (
      crewId: string,
      data: CrewWithLinks,
      params: RequestParams = {},
    ) =>
      this.request<AppEvent[], any>({
        path: `/api/crews/${crewId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateInterval
     * @request POST:/api/intervals
     */
    createInterval: (data: Interval, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/intervals`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetMyState
     * @request GET:/api/me
     */
    getMyState: (params: RequestParams = {}) =>
      this.request<MyInitialData, any>({
        path: `/api/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateMyParticipation
     * @request POST:/api/me/interval/{interval_id}/my_participation
     */
    updateMyParticipation: (
      intervalId: number,
      data: MyParticipationInput,
      params: RequestParams = {},
    ) =>
      this.request<AppEvent[], any>({
        path: `/api/me/interval/${intervalId}/my_participation`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name MyParticipation
     * @request GET:/api/me/participation/interval/{interval_id}
     */
    myParticipation: (intervalId: number, params: RequestParams = {}) =>
      this.request<null | CollectiveInvolvement, any>({
        path: `/api/me/participation/interval/${intervalId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateCollective
     * @request PUT:/api/my_collective
     */
    updateCollective: (data: Collective, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/my_collective`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetInvolvements
     * @request GET:/api/my_collective/interval/{interval_id}/involvements
     */
    getInvolvements: (intervalId: number, params: RequestParams = {}) =>
      this.request<IntervalInvolvementData, any>({
        path: `/api/my_collective/interval/${intervalId}/involvements`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetCollectiveState
     * @request GET:/api/my_collective/state
     */
    getCollectiveState: (params: RequestParams = {}) =>
      this.request<InitialData, any>({
        path: `/api/my_collective/state`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdatePerson
     * @request PUT:/api/people/{person_id}
     */
    updatePerson: (
      personId: string,
      data: Person,
      params: RequestParams = {},
    ) =>
      this.request<AppEvent[], any>({
        path: `/api/people/${personId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetCollectiveBySlug
     * @request GET:/api/public/collective/by_slug/{collective_slug}
     */
    getCollectiveBySlug: (collectiveSlug: string, params: RequestParams = {}) =>
      this.request<Collective, any>({
        path: `/api/public/collective/by_slug/${collectiveSlug}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateEoi
     * @request PUT:/api/public/collective/{collective_id}/eoi/{auth_token}
     */
    updateEoi: (
      authToken: string,
      collectiveId: number,
      data: ExpressionOfInterest,
      params: RequestParams = {},
    ) =>
      this.request<any, EoiError>({
        path: `/api/public/collective/${collectiveId}/eoi/${authToken}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteEoi
     * @request DELETE:/api/public/collective/{collective_id}/eoi/{auth_token}
     */
    deleteEoi: (
      authToken: string,
      collectiveId: number,
      data: ExpressionOfInterest,
      params: RequestParams = {},
    ) =>
      this.request<any, EoiError>({
        path: `/api/public/collective/${collectiveId}/eoi/${authToken}`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetEoiByAuthToken
     * @request GET:/api/public/collective/{collective_id}/interest/by_auth_token/{auth_token}
     */
    getEoiByAuthToken: (
      authToken: string,
      collectiveId: number,
      params: RequestParams = {},
    ) =>
      this.request<ExpressionOfInterest, any>({
        path: `/api/public/collective/${collectiveId}/interest/by_auth_token/${authToken}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateEoi
     * @request POST:/api/public/eoi
     */
    createEoi: (data: ExpressionOfInterest, params: RequestParams = {}) =>
      this.request<any, EoiError>({
        path: `/api/public/eoi`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
